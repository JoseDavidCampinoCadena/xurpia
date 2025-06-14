const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAITaskAssignment() {
  try {
    console.log('🔍 Testing AI Task Assignment Logic...\n');    // Find a project with collaborators and AI tasks
    const projectWithTasks = await prisma.project.findFirst({
      where: {
        collaborators: {
          some: {}
        },
        aiGeneratedTasks: {
          some: {}
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        aiGeneratedTasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!projectWithTasks) {
      console.log('❌ No se encontró ningún proyecto con colaboradores y tareas AI para testear');
      return;
    }    console.log(`📊 Proyecto: ${projectWithTasks.name} (ID: ${projectWithTasks.id})`);
    console.log(`👑 Owner: ${projectWithTasks.owner.name} (ID: ${projectWithTasks.owner.id})`);
    console.log(`👥 Colaboradores: ${projectWithTasks.collaborators.length}`);
    console.log(`📋 Tareas AI: ${projectWithTasks.aiGeneratedTasks.length}\n`);

    // Analyze current task assignments
    let ownerTasks = 0;
    let collaboratorTasks = 0;
    let unassignedTasks = 0;

    console.log('📋 Análisis de asignaciones actuales:');
    
    projectWithTasks.aiGeneratedTasks.forEach((task, index) => {
      if (!task.assignee) {
        unassignedTasks++;
        console.log(`${index + 1}. "${task.title}" - SIN ASIGNAR ✅`);
      } else if (task.assignee.id === projectWithTasks.owner.id) {
        ownerTasks++;
        console.log(`${index + 1}. "${task.title}" - OWNER (${task.assignee.name}) ⚠️`);
      } else {
        collaboratorTasks++;
        console.log(`${index + 1}. "${task.title}" - COLABORADOR (${task.assignee.name}) ✅`);
      }
    });

    console.log('\n📊 Resumen de asignaciones:');
    console.log(`  👑 Tareas asignadas al Owner: ${ownerTasks}`);
    console.log(`  👥 Tareas asignadas a Colaboradores: ${collaboratorTasks}`);
    console.log(`  ❓ Tareas sin asignar: ${unassignedTasks}`);

    // Validate the assignment logic
    console.log('\n✅ Validación:');
    
    if (ownerTasks === 0) {
      console.log('  ✅ CORRECTO: Ninguna tarea asignada automáticamente al owner');
    } else {
      console.log(`  ❌ PROBLEMA: ${ownerTasks} tareas asignadas al owner (deberían estar en colaboradores o sin asignar)`);
    }

    if (unassignedTasks > 0) {
      console.log(`  ✅ CORRECTO: ${unassignedTasks} tareas sin asignar (esperando asignación inteligente)`);
    }

    if (collaboratorTasks > 0) {
      console.log(`  ✅ CORRECTO: ${collaboratorTasks} tareas asignadas a colaboradores`);
    }    // Show collaborator details
    console.log('\n👥 Detalles de colaboradores:');
    projectWithTasks.collaborators.forEach((collab, index) => {
      const assignedToThis = projectWithTasks.aiGeneratedTasks.filter(task => 
        task.assignee && task.assignee.id === collab.user.id
      ).length;
      
      console.log(`  ${index + 1}. ${collab.user.name} (${collab.role}) - ${assignedToThis} tareas asignadas`);
    });

  } catch (error) {
    console.error('❌ Error testing AI task assignment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAITaskAssignment();
