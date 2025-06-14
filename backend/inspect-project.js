const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function inspectProject() {
  try {
    const project = await prisma.project.findUnique({
      where: { id: 29 },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    console.log('📊 Proyecto COMFANDI (ID: 29)');
    console.log('👑 Owner:', project.owner);
    console.log('👥 Colaboradores:');
    project.collaborators.forEach((collab, index) => {
      console.log(`  ${index + 1}. ${collab.user.name} (ID: ${collab.user.id}) - Rol: ${collab.role}`);
    });

    console.log('\n🔍 Análisis:');
    const ownerIsAlsoCollaborator = project.collaborators.some(
      collab => collab.user.id === project.owner.id
    );
    
    if (ownerIsAlsoCollaborator) {
      console.log('⚠️ PROBLEMA: El owner también está listado como colaborador');
      console.log('   Esto hace que sea incluido en la asignación automática');
    } else {
      console.log('✅ CORRECTO: El owner no está duplicado como colaborador');
    }

    console.log(`\n📈 Número de colaboradores únicos: ${project.collaborators.filter(c => c.user.id !== project.owner.id).length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectProject();
