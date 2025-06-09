const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('All tables:');
    allTables.forEach(table => console.log('-', table.table_name));
    
    // Also check Prisma client properties
    console.log('\nPrisma client has aITask:', 'aITask' in prisma);
    console.log('Prisma client has AITask:', 'AITask' in prisma);
    console.log('Prisma client all properties:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
