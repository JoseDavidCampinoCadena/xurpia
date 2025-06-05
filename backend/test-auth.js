const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🔍 Checking existing users...');    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        profession: true,
      },
      take: 5
    });

    console.log('👥 Found users:', users);

    if (users.length === 0) {
      console.log('📝 Creating test user...');
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
        const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Test User',
          profession: 'Software Developer',
          nationality: 'US',
          age: 30,
          languages: ['English'],
          projectsCount: 0
        }
      });
      
      console.log('✅ Test user created:', testUser);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
