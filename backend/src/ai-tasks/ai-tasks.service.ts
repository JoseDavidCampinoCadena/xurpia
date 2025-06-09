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
      }
    });

    if (!task) {
      throw new Error('Task not found or not assigned to user');
    }

    // Update the task status
    const updatedTask = await this.prisma.aITask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Update project progress
    await this.updateProjectProgress(task.projectId);

    return updatedTask;
  }

  async startAiTask(taskId: number, userId: number) {
    const task = await this.prisma.aITask.findFirst({
      where: {
        id: taskId,
        assigneeId: userId
      }
    });

    if (!task) {
      throw new Error('Task not found or not assigned to user');
    }

    return this.prisma.aITask.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS'
      }
    });
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
          
          // Priority: best assignee -> project owner -> requesting user
          let taskAssigneeId = assignee?.user.id || project.ownerId;
          
          // Extra safety: if somehow ownerId is null, use requesting user
          if (!taskAssigneeId) {
            taskAssigneeId = userId;
          }
            console.log(`🎯 Assigning task "${task.title}" to user ${taskAssigneeId}`);
          console.log(`   - Best assignee: ${assignee?.user.id || 'none'}`);
          console.log(`   - Project owner: ${project.ownerId}`);
          console.log(`   - Requesting user: ${userId}`);
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
                evaluations: true
              }
            }
          }
        },
        owner: true
      }
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // Get unassigned AI tasks for the project
    const unassignedTasks = await this.prisma.aITask.findMany({
      where: {
        projectId: projectId,
        assigneeId: null
      },
      orderBy: [
        { dayNumber: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    if (unassignedTasks.length === 0) {
      return {
        message: 'No hay tareas sin asignar para este proyecto',
        assignedTasks: 0
      };
    }

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

    // Process each day
    for (const [day, dayTasks] of Object.entries(tasksByDay)) {
      console.log(`🔄 Asignando tareas del día ${day}...`);
      
      for (const task of dayTasks) {
        // Find best assignee based on skill level and role (from task description)
        const assignee = this.findBestAssignee(project.collaborators, 'developer', task.skillLevel);
        
        // Priority: best assignee -> project owner -> requesting user
        let taskAssigneeId = assignee?.user.id || project.ownerId || userId;
        
        // Update task assignment
        const updatedTask = await this.prisma.aITask.update({
          where: { id: task.id },
          data: { assigneeId: taskAssigneeId },
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
          skillLevel: task.skillLevel
        });

        totalAssigned++;
        
        console.log(`✅ Tarea "${task.title}" asignada a ${updatedTask.assignee?.name || 'Usuario desconocido'}`);
      }
    }

    // Update project progress after assignments
    await this.updateProjectProgress(projectId);

    return {
      message: `Se han asignado ${totalAssigned} tareas automáticamente`,
      assignedTasks: totalAssigned,
      assignments: assignments
    };
  }
}
