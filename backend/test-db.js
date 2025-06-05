const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test if we can query users
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ Can query users:', users.length);
    
    // Test if UserEvaluation table exists and can be queried
    const evaluations = await prisma.userEvaluation.findMany({ take: 1 });
    console.log('✅ Can query userEvaluations:', evaluations.length);
    
    // Test creating a sample evaluation (we'll delete it after)
    const testUser = users[0];
    if (testUser) {
      console.log('🧪 Testing evaluation creation...');
      
      const testEvaluation = await prisma.userEvaluation.create({
        data: {
          userId: testUser.id,
          profession: 'Test',
          technology: 'Test',
          level: 'BEGINNER',
          score: 50,
          questionsData: JSON.stringify({ test: true })
        }
      });
      
      console.log('✅ Test evaluation created:', testEvaluation.id);
      
      // Delete the test evaluation
      await prisma.userEvaluation.delete({
        where: { id: testEvaluation.id }
      });
      
      console.log('✅ Test evaluation deleted');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
