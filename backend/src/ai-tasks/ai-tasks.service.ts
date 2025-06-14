import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../AI/ai.service';

@Injectable()
export class AiTasksService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService
  ) {}

  async getAiTasks(userId: number, projectId?: number, assignedOnly = false) {
    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (assignedOnly) {
      where.assigneeId = userId;
    }

    return this.prisma.aITask.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { dayNumber: 'asc' },
        { createdAt: 'asc' }
      ]
    });
  }
  async completeAiTask(taskId: number, userId: number) {
    // First, verify the task exists and user is assigned
    const task = await this.prisma.aITask.findFirst({
      where: {
        id: taskId,
        assigneeId: userId
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!task) {
      throw new Error('Task not found or not assigned to user');
    }

    // Update the AI task status
    const updatedTask = await this.prisma.aITask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Find and complete the corresponding regular task
    const correspondingTask = await this.prisma.task.findFirst({
      where: {
        title: { startsWith: `[IA] ${task.title}` },
        assigneeId: userId,
        projectId: task.projectId,
        status: { not: 'COMPLETED' }
      }
    });

    if (correspondingTask) {
      await this.prisma.task.update({
        where: { id: correspondingTask.id },
        data: {
          status: 'COMPLETED'
        }
      });
    }

    // Update project progress
    await this.updateProjectProgress(task.projectId);

    return {
      aiTask: updatedTask,
      regularTask: correspondingTask,
      message: 'Tarea completada exitosamente. Se ha actualizado tu progreso personal y del proyecto.'
    };
  }  async startAiTask(taskId: number, userId: number) {
    // First, get the task with project information
    const task = await this.prisma.aITask.findFirst({
      where: {
        id: taskId
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true
              }
            },
            collaborators: {
              where: {
                userId: userId
              },
              select: {
                role: true,
                userId: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user has permission to start this task
    const isProjectOwner = task.project.owner.id === userId;
    const isCollaborator = task.project.collaborators.length > 0;
    const isAssignedToUser = task.assigneeId === userId;
    const isUnassigned = task.assigneeId === null;

    if (!isProjectOwner && !isCollaborator && !isAssignedToUser) {
      throw new Error('You do not have permission to start this task');
    }

    // If task is unassigned, assign it to the current user
    let finalAssigneeId = task.assigneeId;
    if (isUnassigned) {
      finalAssigneeId = userId;
      console.log(`🎯 Auto-assigning unassigned task ${taskId} to user ${userId}`);
    } else if (!isAssignedToUser && !isProjectOwner) {
      throw new Error('Task is assigned to another user');
    }

    // Calculate estimated completion time (3-7 days based on skill level)
    const completionDays = {
      'Principiante': 7,
      'Intermedio': 5,
      'Avanzado': 3
    };
    const daysToComplete = completionDays[task.skillLevel] || 5;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + daysToComplete);

    // Update AI Task status and assignee if needed
    const updatedAiTask = await this.prisma.aITask.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        assigneeId: finalAssigneeId
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create a regular Task entry for the user's task view
    const regularTask = await this.prisma.task.create({
      data: {
        title: `[IA] ${task.title}`,
        description: `${task.description}\n\n📅 Fecha límite estimada: ${estimatedDelivery.toLocaleDateString('es-ES')}\n🎯 Nivel: ${task.skillLevel}\n📊 Día del proyecto: ${task.dayNumber}\n🤖 Tarea generada por IA y asignada por ${task.project.owner.name}`,
        status: 'IN_PROGRESS',
        projectId: task.projectId,
        assigneeId: finalAssigneeId
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`✅ Task "${task.title}" started by user ${userId}, assigned to ${finalAssigneeId}`);

    return {
      aiTask: updatedAiTask,
      regularTask: regularTask,
      message: `Tarea iniciada exitosamente. Aparecerá en tu lista de tareas personales.`,
      estimatedDelivery: estimatedDelivery.toLocaleDateString('es-ES')
    };
  }

  async generateAiTasksForProject(projectId: number, userId: number) {
    // Check if user is project owner or admin
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            collaborators: {
              some: {
                userId: userId,
                role: 'ADMIN'
              }
            }
          }
        ]
      },
      include: {
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                evaluations: {
                  where: { projectId: projectId },
                  select: {
                    technology: true,
                    level: true,
                    profession: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!project) {
      throw new Error('Project not found or insufficient permissions');
    }

    // Get or create AI analysis
    let aiAnalysis;
    if (project.aiSuggestions) {
      try {
        aiAnalysis = JSON.parse(project.aiSuggestions);
      } catch (error) {
        console.error('Error parsing existing AI suggestions:', error);
        // Generate new analysis
        aiAnalysis = await this.generateProjectAnalysis(project);
      }
    } else {
      // Generate new analysis
      aiAnalysis = await this.generateProjectAnalysis(project);
      
      // Save the analysis
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          aiSuggestions: JSON.stringify(aiAnalysis)
        }
      });
    }

    // Generate AI tasks based on analysis
    if (aiAnalysis.dailyTasksPlan) {
      const tasksToCreate = [];
        for (const dayPlan of aiAnalysis.dailyTasksPlan.tasksPerDay) {        for (const task of dayPlan.tasks) {
          // Find best assignee based on skill level and role
          const assignee = this.findBestAssignee(project.collaborators, task.role, task.skillLevel);
          
          // Only assign to collaborators, leave unassigned if no suitable collaborator found
          // This allows for manual assignment later or automatic assignment when new collaborators join
          let taskAssigneeId = assignee?.user.id || null;
          
          console.log(`🎯 Task "${task.title}" assignment:`);
          console.log(`   - Best assignee: ${assignee?.user.id ? assignee.user.name : 'none found'}`);
          console.log(`   - Will be assigned to: ${taskAssigneeId ? assignee.user.name : 'unassigned (will be assigned during daily assignment)'}`);
          console.log(`   - Collaborators count: ${project.collaborators.length}`);
          
          tasksToCreate.push({
            title: task.title,
            description: task.description,
            skillLevel: task.skillLevel,
            estimatedHours: task.estimatedHours,
            dayNumber: dayPlan.day,
            projectId: projectId,
            assigneeId: taskAssigneeId,
            status: 'PENDING' // Use correct enum value
          });
        }
      }

      // Create AI tasks in database
      const createdTasks = await this.prisma.aITask.createMany({
        data: tasksToCreate
      });

      // Update project totals
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          totalAiTasks: tasksToCreate.length,
          completedAiTasks: 0
        }
      });

      return {
        message: 'AI tasks generated successfully',
        tasksCreated: createdTasks.count,
        totalDays: aiAnalysis.dailyTasksPlan.totalDays
      };
    }

    throw new Error('No daily tasks plan found in AI analysis');
  }

  private async generateProjectAnalysis(project: any) {
    try {
      return await this.aiService.analyzeProject(
        project.name,
        project.description || 'Proyecto de desarrollo de software',
        project.estimatedDuration || '2 meses'
      );
    } catch (error) {
      console.error('AI analysis failed, using fallback:', error);
      // Return a basic fallback analysis
      return {
        recommendedTeamSize: 3,
        roles: [
          { title: "Desarrollador Backend", count: 1, description: "Desarrollo de APIs", skillLevel: "Intermedio" },
          { title: "Desarrollador Frontend", count: 1, description: "Interfaces de usuario", skillLevel: "Intermedio" },
          { title: "Arquitecto de Software", count: 1, description: "Diseño de arquitectura", skillLevel: "Avanzado" }
        ],
        estimatedTimeline: project.estimatedDuration || '2 meses',
        keyTechnologies: ["JavaScript", "Node.js", "React"],
        suggestions: ["Implementar metodología Agile", "Establecer CI/CD"],
        dailyTasksPlan: {
          totalDays: 60,
          tasksPerDay: this.generateBasicDailyTasks(60)
        }
      };
    }
  }

  private generateBasicDailyTasks(totalDays: number) {
    const tasks = [];
    for (let day = 1; day <= Math.min(totalDays, 30); day++) { // Limit to 30 days for testing
      const dayTasks = [];
      
      if (day <= 5) {
        // Planning phase
        dayTasks.push({
          title: `Planificación - Día ${day}`,
          description: `Tareas de planificación para el día ${day}`,
          skillLevel: 'Intermedio',
          estimatedHours: 6,
          role: 'Arquitecto de Software'
        });
      } else if (day <= 20) {
        // Development phase
        dayTasks.push({
          title: `Desarrollo - Día ${day}`,
          description: `Tareas de desarrollo para el día ${day}`,
          skillLevel: 'Intermedio',
          estimatedHours: 8,
          role: 'Desarrollador Backend'
        });
      } else {
        // Testing phase
        dayTasks.push({
          title: `Testing - Día ${day}`,
          description: `Tareas de testing para el día ${day}`,
          skillLevel: 'Intermedio',
          estimatedHours: 6,
          role: 'Desarrollador Frontend'
        });
      }
      
      tasks.push({
        day: day,
        tasks: dayTasks
      });
    }
    return tasks;
  }
  private findBestAssignee(collaborators: any[], requiredRole: string, requiredSkillLevel: string) {
    // Score skill levels
    const skillLevelScore = {
      'Principiante': 1,
      'Intermedio': 2,
      'Avanzado': 3
    };

    let bestMatch = null;
    let bestScore = 0;

    for (const collab of collaborators) {
      const user = collab.user;
      let score = 0;

      // Check if user has evaluations
      for (const evaluation of user.evaluations) {
        // Match profession/role
        if (evaluation.profession.toLowerCase().includes(requiredRole.toLowerCase()) ||
            requiredRole.toLowerCase().includes(evaluation.profession.toLowerCase())) {
          score += 2;
        }

        // Match skill level
        const userSkillScore = skillLevelScore[evaluation.level] || 0;
        const requiredSkillScore = skillLevelScore[requiredSkillLevel] || 0;
        
        if (userSkillScore >= requiredSkillScore) {
          score += 1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = collab;
      }
    }

    return bestMatch;
  }

  private findBestAssigneeWithLimits(
    projectUsers: any[], 
    requiredSkillLevel: string, 
    currentDayAssignments: Map<number, number>,
    maxTasksPerUser: number
  ) {
    // Score skill levels
    const skillLevelScore = {
      'Principiante': 1,
      'Intermedio': 2,
      'Avanzado': 3
    };

    let bestMatch = null;
    let bestScore = -1;

    for (const projectUser of projectUsers) {
      const user = projectUser.user;
      
      // Skip if user has reached daily limit
      const currentAssignments = currentDayAssignments.get(user.id) || 0;
      if (currentAssignments >= maxTasksPerUser) {
        console.log(`⏭️ Usuario ${user.name} ya tiene ${currentAssignments} tareas asignadas (límite: ${maxTasksPerUser})`);
        continue;
      }      let score = 0;
      let hasRelevantEvaluation = false;

      // Base score for being a collaborator (ready to work)
      score += 2;

      // Check evaluations for skill matching
      if (user.evaluations && user.evaluations.length > 0) {
        for (const evaluation of user.evaluations) {
          hasRelevantEvaluation = true;
          
          // Score based on skill level match
          const userSkillScore = skillLevelScore[evaluation.level] || 0;
          const requiredSkillScore = skillLevelScore[requiredSkillLevel] || 0;
          
          if (userSkillScore >= requiredSkillScore) {
            // Perfect match or user is more skilled
            score += 5;
            if (userSkillScore === requiredSkillScore) {
              score += 2; // Bonus for exact match
            }
          } else {
            // User is less skilled, give partial credit but lower score
            score += Math.max(0, userSkillScore - 1);
          }

          // Bonus for having multiple evaluations (more experienced)
          score += 0.5;
        }
      } else {
        // No evaluations - assign basic score but lower priority
        const requiredSkillScore = skillLevelScore[requiredSkillLevel] || 1;
        score += Math.max(1, 4 - requiredSkillScore); // Lower score for higher difficulty tasks
      }

      // Bonus for having fewer current assignments (load balancing)
      score += (maxTasksPerUser - currentAssignments) * 2;

      console.log(`👤 Usuario ${user.name}: Score ${score}, Evaluaciones: ${user.evaluations?.length || 0}, Asignaciones actuales: ${currentAssignments}`);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = projectUser;
      }
    }

    if (bestMatch) {
      console.log(`🎯 Mejor asignado: ${bestMatch.user.name} (Score: ${bestScore})`);
    }

    return bestMatch;
  }

  async updateProjectProgress(projectId: number) {
    const completed = await this.prisma.aITask.count({
      where: {
        projectId: projectId,
        status: 'COMPLETED'
      }
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        completedAiTasks: completed
      }
    });
  }

  async getProjectProgress(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        totalAiTasks: true,
        completedAiTasks: true,
        estimatedDuration: true,
        aiSuggestions: true,
        ownerId: true
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const aiTasks = await this.prisma.aITask.findMany({
      where: { projectId: projectId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Calculate progress metrics
    const totalTasks = project.totalAiTasks || aiTasks.length;
    const completedTasks = project.completedAiTasks || 0;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate by collaborator
    const collaboratorProgress = new Map();
    
    aiTasks.forEach(task => {
      if (task.assignee) {
        const existing = collaboratorProgress.get(task.assignee.id) || {
          id: task.assignee.id,
          name: task.assignee.name,
          total: 0,
          completed: 0
        };
        
        existing.total++;
        if (task.status === 'COMPLETED') {
          existing.completed++;
        }
        
        collaboratorProgress.set(task.assignee.id, existing);
      }
    });

    // Calculate by day
    const dailyProgress = {};
    aiTasks.forEach(task => {
      if (!dailyProgress[task.dayNumber]) {
        dailyProgress[task.dayNumber] = {
          day: task.dayNumber,
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0
        };
      }
      
      dailyProgress[task.dayNumber].total++;
      if (task.status === 'COMPLETED') {
        dailyProgress[task.dayNumber].completed++;
      } else if (task.status === 'IN_PROGRESS') {
        dailyProgress[task.dayNumber].inProgress++;
      } else {
        dailyProgress[task.dayNumber].pending++;
      }
    });

    let aiAnalysis = null;
    if (project.aiSuggestions) {
      try {
        aiAnalysis = JSON.parse(project.aiSuggestions);
      } catch (error) {
        console.error('Error parsing AI suggestions:', error);
      }
    }    return {
      totalAiTasks: totalTasks,
      completedAiTasks: completedTasks,
      progressPercentage,
      estimatedDuration: project.estimatedDuration,
      collaboratorProgress: Array.from(collaboratorProgress.values()),
      dailyProgress: Object.values(dailyProgress),
      aiAnalysis: aiAnalysis
    };
  }
  async assignDailyTasks(projectId: number, userId: number) {
    // First, verify user has access to the project
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            collaborators: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        collaborators: {
          include: {
            user: {
              include: {
                evaluations: {
                  where: {
                    projectId: projectId
                  }
                }
              }
            }
          }
        },
        owner: {
          include: {
            evaluations: {
              where: {
                projectId: projectId
              }
            }
          }
        }
      }
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }    // Get all users in project (ONLY collaborators, exclude owner from automatic assignment)
    // Owners should focus on project management, not task execution
    // Filter out owner even if they're listed as a collaborator
    const allProjectUsers = project.collaborators
      .filter(c => c.user.id !== project.owner.id) // Exclude owner
      .map(c => ({ user: c.user, role: c.role }));

    console.log(`👥 Usuarios disponibles para asignación: ${allProjectUsers.length} colaboradores (excluyendo owner)`);
    console.log(`👑 Owner excluido: ${project.owner.name} (ID: ${project.owner.id})`);
    
    if (allProjectUsers.length === 0) {
      return {
        message: 'No hay colaboradores disponibles para asignación automática. El owner debe asignar tareas manualmente o invitar colaboradores.',
        assignedTasks: 0,
        assignments: []
      };
    }

    // Get current date to determine which day tasks should be assigned for
    const currentDay = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get unassigned AI tasks for the current day and upcoming days (not past days)
    const unassignedTasks = await this.prisma.aITask.findMany({
      where: {
        projectId: projectId,
        assigneeId: null,
        dayNumber: {
          gte: currentDay // Only assign tasks for current day and future days
        }
      },
      orderBy: [
        { dayNumber: 'asc' },
        { skillLevel: 'asc' }, // Prioritize easier tasks first
        { createdAt: 'asc' }
      ]
    });

    if (unassignedTasks.length === 0) {
      return {
        message: 'No hay tareas sin asignar para el día actual o días futuros',
        assignedTasks: 0,
        assignments: []
      };
    }

    // Check existing assignments for today to avoid over-assignment
    const existingTodayAssignments = await this.prisma.aITask.groupBy({
      by: ['assigneeId'],
      where: {
        projectId: projectId,
        dayNumber: currentDay,
        assigneeId: {
          not: null
        }
      },
      _count: {
        id: true
      }
    });

    const todayAssignmentCount = new Map();
    existingTodayAssignments.forEach(assignment => {
      todayAssignmentCount.set(assignment.assigneeId, assignment._count.id);
    });

    const assignments = [];
    
    // Group tasks by day for better distribution
    const tasksByDay = unassignedTasks.reduce((acc, task) => {
      if (!acc[task.dayNumber]) {
        acc[task.dayNumber] = [];
      }
      acc[task.dayNumber].push(task);
      return acc;
    }, {} as Record<number, any[]>);

    let totalAssigned = 0;

    // Process each day starting from current day
    for (const [day, dayTasks] of Object.entries(tasksByDay).sort(([a], [b]) => parseInt(a) - parseInt(b))) {
      const dayNumber = parseInt(day);
      console.log(`🔄 Asignando tareas del día ${day}...`);
      
      // For today, ensure max 1 task per user
      const maxTasksPerUser = dayNumber === currentDay ? 1 : 2; // Today: 1 task, future days: up to 2 tasks
      
      for (const task of dayTasks) {
        // Find best assignee based on skill level, evaluations, and daily assignment limits
        const assignee = this.findBestAssigneeWithLimits(
          allProjectUsers, 
          task.skillLevel, 
          dayNumber === currentDay ? todayAssignmentCount : new Map(),
          maxTasksPerUser
        );
        
        if (!assignee) {
          console.log(`⚠️ No se pudo encontrar un asignado adecuado para la tarea "${task.title}" del día ${day}`);
          continue;
        }

        // Update assignment count for today if it's today's task
        if (dayNumber === currentDay) {
          const currentCount = todayAssignmentCount.get(assignee.user.id) || 0;
          todayAssignmentCount.set(assignee.user.id, currentCount + 1);
        }
        
        // Update task assignment
        const updatedTask = await this.prisma.aITask.update({
          where: { id: task.id },
          data: { assigneeId: assignee.user.id },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        assignments.push({
          taskId: task.id,
          taskTitle: task.title,
          assigneeName: updatedTask.assignee?.name || 'Usuario desconocido',
          dayNumber: task.dayNumber,
          skillLevel: task.skillLevel,
          assigneeRole: assignee.role
        });

        totalAssigned++;
        
        console.log(`✅ Tarea "${task.title}" (${task.skillLevel}) asignada a ${updatedTask.assignee?.name || 'Usuario desconocido'} para el día ${day}`);
      }
    }

    // Update project progress after assignments
    await this.updateProjectProgress(projectId);

    return {
      message: `Se han asignado ${totalAssigned} tareas automáticamente considerando el nivel de cada usuario y límites diarios`,
      assignedTasks: totalAssigned,
      assignments: assignments
    };
  }
}
