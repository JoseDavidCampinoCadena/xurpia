const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMembershipIntegration() {
  try {
    console.log('🧪 Testing Membership Integration...');
    
    // 1. Create a test user with FREE membership
    console.log('\n1. Creating test user with FREE membership...');
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        membershipType: 'FREE'
      },
      create: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        membershipType: 'FREE'
      }
    });
    console.log('✅ Test user created:', testUser.id, testUser.membershipType);

    // 2. Create a test project
    console.log('\n2. Creating test project...');
    const testProject = await prisma.project.upsert({
      where: { id: 1 },
      update: {
        name: 'Test Project',
        logo: 'https://example.com/logo.png'
      },
      create: {
        name: 'Test Project',
        logo: 'https://example.com/logo.png',
        ownerId: testUser.id
      }
    });
    console.log('✅ Test project created:', testProject.id, testProject.name);

    // 3. Check current evaluations for the user/project/technology
    console.log('\n3. Checking current evaluations...');
    const currentEvals = await prisma.userEvaluation.findMany({
      where: {
        userId: testUser.id,
        projectId: testProject.id,
        technology: 'JavaScript'
      }
    });
    console.log('📊 Current evaluations:', currentEvals.length);

    // 4. Test membership limits
    console.log('\n4. Testing membership limits...');
    
    const membershipLimits = {
      FREE: 1,
      PRO: 3,
      ENTERPRISE: Infinity
    };
    
    const userLimit = membershipLimits[testUser.membershipType] || 1;
    const canCreateEvaluation = currentEvals.length < userLimit;
    
    console.log(`👤 User: ${testUser.membershipType}, Limit: ${userLimit}, Current: ${currentEvals.length}, Can create: ${canCreateEvaluation}`);

    // 5. If we can create evaluation, test the creation
    if (canCreateEvaluation) {
      console.log('\n5. Testing evaluation creation...');
      
      const newEvaluation = await prisma.userEvaluation.create({
        data: {
          userId: testUser.id,
          projectId: testProject.id,
          profession: 'Frontend Developer',
          technology: 'JavaScript',
          level: 'INTERMEDIATE',
          score: 75,
          feedback: 'Good understanding of JavaScript fundamentals',
          questionsData: JSON.stringify({
            questions: [],
            userAnswers: [],
            easyCorrect: 2,
            mediumCorrect: 3,
            hardCorrect: 1
          })
        }
      });
      
      console.log('✅ Evaluation created:', newEvaluation.id);
      
      // Now check if user has reached the limit
      const updatedEvals = await prisma.userEvaluation.count({
        where: {
          userId: testUser.id,
          projectId: testProject.id,
          technology: 'JavaScript'
        }
      });
      
      const nowCanCreate = updatedEvals < userLimit;
      console.log(`📊 After creation - Count: ${updatedEvals}, Can create more: ${nowCanCreate}`);
      
      if (!nowCanCreate) {
        console.log('🚫 User has reached FREE limit for JavaScript evaluations in this project');
        console.log('💡 User would need to upgrade to PRO for more evaluations');
      }
    } else {
      console.log('🚫 User has already reached their evaluation limit');
    }

    // 6. Test upgrade simulation
    console.log('\n6. Testing membership upgrade simulation...');
    await prisma.user.update({
      where: { id: testUser.id },
      data: { membershipType: 'PRO' }
    });
    
    const upgradedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    
    const newLimit = membershipLimits[upgradedUser.membershipType];
    console.log(`🎯 User upgraded to: ${upgradedUser.membershipType}, New limit: ${newLimit}`);
    
    // 7. Test project access validation
    console.log('\n7. Testing project access validation...');
    const userProjects = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        projects: true,
        collaborations: {
          include: {
            project: true
          }
        }
      }
    });
    
    const allUserProjects = [
      ...userProjects.projects,
      ...userProjects.collaborations.map(c => c.project)
    ];
    
    console.log(`📋 User has access to ${allUserProjects.length} projects`);
    allUserProjects.forEach(p => console.log(`  - ${p.name} (${p.id})`));
    
    const hasAccessToTestProject = allUserProjects.some(p => p.id === testProject.id);
    console.log(`✅ Has access to test project: ${hasAccessToTestProject}`);
    
    console.log('\n🎉 Membership integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMembershipIntegration()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
