const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDuplicateEvaluations() {
  try {
    console.log('🔍 Buscando evaluaciones duplicadas...');
    
    // Encontrar duplicados basados en userId, projectId, technology
    const duplicates = await prisma.$queryRaw`
      SELECT "userId", "projectId", technology, COUNT(*) as count
      FROM "UserEvaluation" 
      WHERE "projectId" IS NOT NULL
      GROUP BY "userId", "projectId", technology 
      HAVING COUNT(*) > 1
    `;
    
    console.log(`📋 Encontrados ${duplicates.length} grupos de evaluaciones duplicadas`);
    
    if (duplicates.length === 0) {
      console.log('✅ No hay duplicados que corregir');
      return;
    }
    
    // Para cada grupo de duplicados, mantener solo el más reciente
    for (const duplicate of duplicates) {
      console.log(`🔧 Corrigiendo duplicados para usuario ${duplicate.userId}, proyecto ${duplicate.projectId}, tecnología ${duplicate.technology}`);
      
      // Obtener todas las evaluaciones duplicadas ordenadas por fecha (más reciente primero)
      const evaluations = await prisma.userEvaluation.findMany({
        where: {
          userId: Number(duplicate.userId),
          projectId: Number(duplicate.projectId),
          technology: duplicate.technology
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Mantener la primera (más reciente) y eliminar las demás
      const toKeep = evaluations[0];
      const toDelete = evaluations.slice(1);
      
      console.log(`  📌 Manteniendo evaluación ID ${toKeep.id} (${toKeep.createdAt})`);
      console.log(`  🗑️  Eliminando ${toDelete.length} evaluaciones duplicadas`);
      
      // Eliminar las evaluaciones duplicadas
      for (const evaluation of toDelete) {
        await prisma.userEvaluation.delete({
          where: { id: evaluation.id }
        });
        console.log(`    ❌ Eliminada evaluación ID ${evaluation.id}`);
      }
    }
    
    console.log('✅ Limpieza de duplicados completada');
    
  } catch (error) {
    console.error('❌ Error al limpiar duplicados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateEvaluations();
