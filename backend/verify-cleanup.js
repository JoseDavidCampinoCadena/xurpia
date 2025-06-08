const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyCleanup() {
  try {
    console.log('🔍 Verificando limpieza de datos...');
    
    // Verificar que no hay duplicados
    const evaluations = await prisma.userEvaluation.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log(`📊 Total de evaluaciones: ${evaluations.length}`);
    
    // Agrupar por usuario y tecnología
    const groups = {};
    evaluations.forEach(eval => {
      const key = `${eval.userId}-${eval.technology}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(eval);
    });
    
    const duplicates = Object.entries(groups).filter(([key, evals]) => evals.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No hay duplicados. Los datos están limpios.');
      
      // Mostrar evaluaciones actuales
      console.log('\n📋 Evaluaciones actuales:');
      evaluations.forEach(eval => {
        console.log(`  - Usuario: ${eval.user.name}, Tecnología: ${eval.technology}, Nivel: ${eval.level}, Puntuación: ${eval.score}`);
      });
      
      // Mostrar usuarios con proyectos
      const users = await prisma.user.findMany({
        include: {
          projects: true,
          collaborations: true,
          evaluations: true
        }
      });
      
      console.log('\n👥 Usuarios y sus proyectos:');
      users.forEach(user => {
        const totalProjects = user.projects.length + user.collaborations.length;
        console.log(`  - ${user.name}: ${user.projects.length} proyectos propios, ${user.collaborations.length} colaboraciones, ${user.evaluations.length} evaluaciones`);
      });
      
    } else {
      console.log(`❌ Aún hay ${duplicates.length} duplicados`);
      duplicates.forEach(([key, evals]) => {
        console.log(`  ${key}: ${evals.length} evaluaciones`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCleanup();
