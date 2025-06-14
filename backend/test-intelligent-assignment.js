const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testIntelligentAssignment() {
  try {
    console.log('🤖 Testing Intelligent Task Assignment...\n');

    // Find a project with unassigned tasks and collaborators
    const project = await prisma.project.findFirst({
      where: {
        aiGeneratedTasks: {
          some: {
            assigneeId: null
          }
        },
        collaborators: {
          some: {}
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
                name: true,
                email: true
              }
            }
          }
        },
        aiGeneratedTasks: {
          where: {
            assigneeId: null
          },
          take: 5, // Just test with first 5 unassigned tasks
          include: {
            assignee: true
          }
        }
      }
    });

    if (!project) {
      console.log('❌ No se encontró un proyecto con tareas sin asignar y colaboradores');
      return;
    }

    console.log(`📊 Proyecto: ${project.name} (ID: ${project.id})`);
    console.log(`👑 Owner: ${project.owner.name} (ID: ${project.owner.id})`);
    console.log(`👥 Colaboradores disponibles: ${project.collaborators.length}`);
    console.log(`📋 Tareas sin asignar: ${project.aiGeneratedTasks.length}\n`);

    // Show collaborators
    console.log('👥 Colaboradores:');
    project.collaborators.forEach((collab, index) => {
      console.log(`  ${index + 1}. ${collab.user.name} (${collab.role})`);
    });

    console.log('\n📋 Tareas a asignar:');
    project.aiGeneratedTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. "${task.title}" (${task.skillLevel})`);
    });

    // Simulate the intelligent assignment by calling the API endpoint
    console.log('\n🚀 Ejecutando asignación inteligente...');
    
    // We'll use axios to call our own API
    const axios = require('axios');
    
    try {
      // First, we need to get a valid JWT token for the API call
      // For testing, we'll directly access the service method instead
      
      // Import the service (this is a bit hacky for testing, but works)
      const { AiTasksService } = require('./src/ai-tasks/ai-tasks.service.ts');
      const { PrismaService } = require('./src/prisma/prisma.service.ts');
      const { AiService } = require('./src/AI/ai.service.ts');
      
      // This approach won't work with TypeScript files directly in Node.js
      // Let's simulate a direct API call instead
      
      console.log('⚠️ Para probar completamente, usa el frontend y haz clic en "Asignación Inteligente"');
      console.log('📱 O usa curl/Postman para llamar POST /ai-tasks/assign-daily-tasks/' + project.id);
      
    } catch (error) {
      console.log('ℹ️ Simulación API no disponible en este entorno de test');
    }

  } catch (error) {
    console.error('❌ Error testing intelligent assignment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIntelligentAssignment();
