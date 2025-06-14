const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetAITaskAssignments() {
  try {
    console.log('🔄 Reseteando asignaciones de tareas AI...\n');    // Find the project with the most AI tasks assigned to owner
    const projectWithOwnerTasks = await prisma.project.findFirst({
      where: {
        aiGeneratedTasks: {
          some: {}
        },
        collaborators: {
          some: {} // Has collaborators
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        aiGeneratedTasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        id: 'desc' // Get most recent project
      }
    });

    if (!projectWithOwnerTasks) {
      console.log('❌ No se encontraron proyectos con tareas asignadas al owner');
      return;
    }    console.log(`📊 Proyecto seleccionado: ${projectWithOwnerTasks.name} (ID: ${projectWithOwnerTasks.id})`);
    console.log(`👑 Owner: ${projectWithOwnerTasks.owner.name}`);
    console.log(`👥 Colaboradores: ${projectWithOwnerTasks.collaborators.length}`);
    console.log(`📋 Total tareas AI: ${projectWithOwnerTasks.aiGeneratedTasks.length}\n`);

    // Count tasks assigned to owner
    const ownerTasksCount = projectWithOwnerTasks.aiGeneratedTasks.filter(
      task => task.assignee && task.assignee.id === projectWithOwnerTasks.owner.id
    ).length;

    const assignedTasksCount = projectWithOwnerTasks.aiGeneratedTasks.filter(
      task => task.assignee !== null
    ).length;    console.log(`⚠️ Tareas asignadas al owner: ${ownerTasksCount}`);
    console.log(`📊 Total tareas asignadas: ${assignedTasksCount}`);

    if (ownerTasksCount === 0) {
      console.log('✅ No hay tareas asignadas al owner. El sistema ya está funcionando correctamente.');
      return;
    }

    // Reset all task assignments to null
    console.log('\n🔄 Reseteando todas las asignaciones...');
    
    const resetResult = await prisma.aITask.updateMany({
      where: {
        projectId: projectWithOwnerTasks.id,
        assigneeId: {
          not: null
        }
      },
      data: {
        assigneeId: null
      }
    });

    console.log(`✅ Se han reseteado ${resetResult.count} asignaciones de tareas`);
    
    console.log('\n🎯 Ahora puedes usar la "Asignación Inteligente" desde el frontend para distribuir las tareas correctamente entre los colaboradores.');
    console.log('\nPasos siguientes:');
    console.log('1. Ve a la página de AI Tasks del proyecto');
    console.log('2. Haz clic en el botón "Asignación Inteligente"');
    console.log('3. Las tareas se asignarán preferentemente a colaboradores, no al owner');

  } catch (error) {
    console.error('❌ Error reseting AI task assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAITaskAssignments();
