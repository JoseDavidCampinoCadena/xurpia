const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEvaluations() {
  try {
    console.log('📋 Checking saved evaluations...');
    
    const evaluations = await prisma.userEvaluation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log('📊 Recent evaluations:');
    evaluations.forEach((eval, index) => {
      console.log(`${index + 1}. User: ${eval.user.name} (${eval.user.email})`);
      console.log(`   Technology: ${eval.technology}`);
      console.log(`   Profession: ${eval.profession}`);
      console.log(`   Level: ${eval.level}`);
      console.log(`   Score: ${eval.score}`);
      console.log(`   Date: ${eval.createdAt}`);
      console.log('---');
    });

    console.log(`\n✅ Total evaluations found: ${evaluations.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEvaluations();
