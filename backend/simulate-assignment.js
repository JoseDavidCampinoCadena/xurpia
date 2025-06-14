const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simulate the assignDailyTasks service method logic
async function simulateAssignDailyTasks(projectId, userId) {
  try {
    console.log(`🔄 Simulando assignDailyTasks para proyecto ${projectId} por usuario ${userId}...`);

    // First, verify user has access to the project
    const project = await prisma.project.findFirst({
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
    // Filter out owner even if they're listed as a collaborator
    const allProjectUsers = project.collaborators
      .filter(c => c.user.id !== project.owner.id) // Exclude owner
      .map(c => ({ user: c.user, role: c.role }));

    console.log(`👥 Usuarios disponibles para asignación: ${allProjectUsers.length} colaboradores (excluyendo owner)`);
    console.log(`👑 Owner excluido: ${project.owner.name} (ID: ${project.owner.id})`);
    
    if (allProjectUsers.length === 0) {
      console.log('❌ No hay colaboradores disponibles para asignación automática');
      return {
        message: 'No hay colaboradores disponibles para asignación automática. El owner debe asignar tareas manualmente o invitar colaboradores.',
        assignedTasks: 0,
        assignments: []
      };
    }

    // Get current date to determine which day tasks should be assigned for
    const currentDay = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get unassigned AI tasks for the current day and upcoming days (not past days)
    const unassignedTasks = await prisma.aITask.findMany({
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
      ],
      take: 10 // Just test with first 10 tasks
    });

    console.log(`📋 Tareas sin asignar encontradas: ${unassignedTasks.length}`);

    if (unassignedTasks.length === 0) {
      console.log('✅ No hay tareas sin asignar para el día actual o días futuros');
      return {
        message: 'No hay tareas sin asignar para el día actual o días futuros',
        assignedTasks: 0,
        assignments: []
      };
    }

    console.log('👥 Colaboradores disponibles:');
    allProjectUsers.forEach((user, index) => {
      const evaluationsCount = user.user.evaluations ? user.user.evaluations.length : 0;
      console.log(`  ${index + 1}. ${user.user.name} (${user.role}) - ${evaluationsCount} evaluaciones`);
    });

    console.log('\n📋 Tareas para asignar:');
    unassignedTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. "${task.title}" (${task.skillLevel}) - Día ${task.dayNumber}`);
    });

    // Simple assignment logic: round-robin among collaborators
    const assignments = [];
    let collaboratorIndex = 0;

    for (const task of unassignedTasks) {
      const assignedCollaborator = allProjectUsers[collaboratorIndex];
      
      // Update task assignment
      await prisma.aITask.update({
        where: { id: task.id },
        data: { assigneeId: assignedCollaborator.user.id }
      });

      assignments.push({
        taskId: task.id,
        taskTitle: task.title,
        assigneeName: assignedCollaborator.user.name,
        dayNumber: task.dayNumber,
        skillLevel: task.skillLevel,
        assigneeRole: assignedCollaborator.role
      });

      console.log(`✅ Tarea "${task.title}" asignada a ${assignedCollaborator.user.name}`);

      // Move to next collaborator (round-robin)
      collaboratorIndex = (collaboratorIndex + 1) % allProjectUsers.length;
    }

    console.log(`\n🎯 Asignación completada: ${assignments.length} tareas asignadas`);

    return {
      message: `Se han asignado ${assignments.length} tareas automáticamente entre los colaboradores`,
      assignedTasks: assignments.length,
      assignments: assignments
    };

  } catch (error) {
    console.error('❌ Error en simulateAssignDailyTasks:', error);
    throw error;
  }
}

async function main() {
  try {
    const result = await simulateAssignDailyTasks(29, 22); // Project COMFANDI, user admin
    console.log('\n📊 Resultado final:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
