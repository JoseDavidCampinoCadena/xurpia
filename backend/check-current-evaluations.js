const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentEvaluations() {
  try {
    console.log('🔍 Revisando estructura actual de evaluaciones...');
    
    // Ver todas las evaluaciones actuales
    const evaluations = await prisma.userEvaluation.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log(`📋 Total de evaluaciones: ${evaluations.length}`);
    
    // Mostrar las primeras evaluaciones para entender la estructura
    if (evaluations.length > 0) {
      console.log('\n📊 Primeras evaluaciones:');
      evaluations.slice(0, 5).forEach((eval, index) => {
        console.log(`${index + 1}. ID: ${eval.id}, Usuario: ${eval.user.name} (${eval.userId}), Tecnología: ${eval.technology}, Nivel: ${eval.level}, Puntuación: ${eval.score}`);
      });
    }
    
    // Agrupar por usuario y tecnología para ver duplicados
    const groupedEvaluations = {};
    evaluations.forEach(evaluation => {
      const key = `${evaluation.userId}-${evaluation.technology}`;
      if (!groupedEvaluations[key]) {
        groupedEvaluations[key] = [];
      }
      groupedEvaluations[key].push(evaluation);
    });
    
    // Encontrar duplicados
    const duplicates = Object.entries(groupedEvaluations).filter(([key, evals]) => evals.length > 1);
    
    console.log(`\n🔄 Duplicados encontrados: ${duplicates.length}`);
    if (duplicates.length > 0) {
      duplicates.forEach(([key, evals]) => {
        const [userId, technology] = key.split('-');
        console.log(`  Usuario ${userId}, Tecnología ${technology}: ${evals.length} evaluaciones`);
        evals.forEach(eval => {
          console.log(`    - ID: ${eval.id}, Fecha: ${eval.createdAt}, Puntuación: ${eval.score}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentEvaluations();
