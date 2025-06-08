const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupForMigration() {
  try {
    console.log('🔧 Preparando datos para la migración del sistema de membresías...');
    
    // 1. Limpiar duplicados de evaluaciones por usuario/tecnología
    console.log('\n📋 Paso 1: Limpiando evaluaciones duplicadas...');
    
    const evaluations = await prisma.userEvaluation.findMany({
      orderBy: [
        { userId: 'asc' },
        { technology: 'asc' },
        { createdAt: 'desc' } // Más reciente primero
      ]
    });
    
    const seen = new Set();
    const toDelete = [];
    
    for (const evaluation of evaluations) {
      const key = `${evaluation.userId}-${evaluation.technology}`;
      if (seen.has(key)) {
        toDelete.push(evaluation.id);
        console.log(`  🗑️  Marcando para eliminar: ID ${evaluation.id} (Usuario ${evaluation.userId}, ${evaluation.technology})`);
      } else {
        seen.add(key);
        console.log(`  ✅ Manteniendo: ID ${evaluation.id} (Usuario ${evaluation.userId}, ${evaluation.technology})`);
      }
    }
    
    // Eliminar duplicados
    if (toDelete.length > 0) {
      console.log(`\n🗑️  Eliminando ${toDelete.length} evaluaciones duplicadas...`);
      await prisma.userEvaluation.deleteMany({
        where: {
          id: {
            in: toDelete
          }
        }
      });
      console.log('✅ Duplicados eliminados');
    } else {
      console.log('✅ No hay duplicados que eliminar');
    }
    
    // 2. Verificar usuarios y sus proyectos para la asignación
    console.log('\n📋 Paso 2: Preparando asignación de evaluaciones a proyectos...');
    
    const users = await prisma.user.findMany({
      include: {
        collaboratedProjects: {
          include: {
            project: true
          }
        },
        ownedProjects: true,
        evaluations: true
      }
    });
    
    for (const user of users) {
      const allProjects = [
        ...user.ownedProjects,
        ...user.collaboratedProjects.map(cp => cp.project)
      ];
      
      console.log(`\n👤 Usuario: ${user.name} (ID: ${user.id})`);
      console.log(`  📁 Proyectos disponibles: ${allProjects.length}`);
      console.log(`  📊 Evaluaciones: ${user.evaluations.length}`);
      
      if (user.evaluations.length > 0 && allProjects.length === 0) {
        console.log(`  ⚠️  ADVERTENCIA: Usuario tiene evaluaciones pero no proyectos. Se necesita crear un proyecto por defecto.`);
      }
      
      allProjects.forEach((project, index) => {
        console.log(`    ${index + 1}. ${project.name} (ID: ${project.id})`);
      });
    }
    
    console.log('\n✅ Preparación completada. Los datos están listos para la migración.');
    
  } catch (error) {
    console.error('❌ Error en la preparación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupForMigration();
