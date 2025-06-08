const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  try {
    console.log('🔍 Verificando migración del sistema de membresías...');
    
    // Verificar los nuevos campos en User
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        membershipType: true,
        membershipExpiresAt: true,
        evaluations: true,
        projects: true,
        collaborations: true
      }
    });
    
    console.log('\n👥 Usuarios con información de membresía:');
    users.forEach(user => {
      console.log(`  - ${user.name} (ID: ${user.id})`);
      console.log(`    Membresía: ${user.membershipType}`);
      console.log(`    Expira: ${user.membershipExpiresAt || 'N/A'}`);
      console.log(`    Evaluaciones: ${user.evaluations.length}`);
      console.log(`    Proyectos: ${user.projects.length + user.collaborations.length}`);
    });
    
    // Verificar las evaluaciones con projectId
    const evaluations = await prisma.userEvaluation.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log('\n📊 Evaluaciones con projectId:');
    evaluations.forEach(eval => {
      console.log(`  - Usuario: ${eval.user.name}, Proyecto: ${eval.project?.name || 'N/A'}, Tecnología: ${eval.technology}`);
    });
    
    console.log('\n✅ Migración verificada correctamente!');
    
  } catch (error) {
    console.error('❌ Error al verificar migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
