import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test if aITask exists
console.log('Has aITask:', 'aITask' in prisma);
console.log('aITask type:', typeof prisma.aITask);

// Test a simple query
async function testAITask() {
  try {
    const count = await prisma.aITask.count();
    console.log('AITask count:', count);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAITask();
