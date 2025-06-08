const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMembershipAPI() {
  try {
    console.log('🧪 Testing Membership API endpoints...');
    
    // 1. First, create a test user and get auth token
    console.log('\n1. Creating test user and getting auth token...');
    
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'apitest@example.com',
        password: 'testpass123',
        name: 'API Test User'
      });
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists, proceeding with login');
      } else {
        throw error;
      }
    }
    
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'apitest@example.com',
      password: 'testpass123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, token obtained');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Test membership info endpoint
    console.log('\n2. Testing membership info endpoint...');
    const membershipInfo = await axios.get(`${BASE_URL}/membership/info`, { headers });
    console.log('✅ Membership info:', membershipInfo.data);
    
    // 3. Test evaluation usage endpoint
    console.log('\n3. Testing evaluation usage endpoint...');
    const usageInfo = await axios.get(`${BASE_URL}/membership/usage`, { headers });
    console.log('✅ Usage info:', usageInfo.data);
    
    // 4. Test available plans endpoint
    console.log('\n4. Testing available plans endpoint...');
    const plansInfo = await axios.get(`${BASE_URL}/membership/plans`, { headers });
    console.log('✅ Available plans:', plansInfo.data.length, 'plans found');
    
    // 5. Create a test project for evaluation testing
    console.log('\n5. Creating a test project...');
    const projectResponse = await axios.post(`${BASE_URL}/projects`, {
      name: 'API Test Project',
      logo: 'https://example.com/logo.png',
      description: 'Test project for API testing'
    }, { headers });
    
    const projectId = projectResponse.data.id;
    console.log('✅ Project created:', projectId);
    
    // 6. Test can-evaluate endpoint
    console.log('\n6. Testing can-evaluate endpoint...');
    const canEvaluate = await axios.get(
      `${BASE_URL}/membership/can-evaluate/${projectId}/JavaScript`, 
      { headers }
    );
    console.log('✅ Can evaluate JavaScript:', canEvaluate.data);
    
    // 7. Test evaluation generation (this should work with membership limits)
    console.log('\n7. Testing evaluation generation...');
    const evaluationResponse = await axios.post(`${BASE_URL}/evaluations/generate`, {
      profession: 'Frontend Developer',
      technology: 'JavaScript',
      projectId: projectId
    }, { headers });
    
    console.log('✅ Questions generated:', evaluationResponse.data.questions.length, 'questions');
    
    // 8. Test evaluation submission
    console.log('\n8. Testing evaluation submission...');
    const questions = evaluationResponse.data.questions;
    const userAnswers = questions.map(() => 0); // Answer all with option 0
    
    const submissionResponse = await axios.post(`${BASE_URL}/evaluations/submit`, {
      profession: 'Frontend Developer',
      technology: 'JavaScript',
      questions: questions,
      userAnswers: userAnswers,
      projectId: projectId
    }, { headers });
    
    console.log('✅ Evaluation submitted:', submissionResponse.data);
    
    // 9. Test second evaluation (should fail for FREE users)
    console.log('\n9. Testing second evaluation (should fail for FREE users)...');
    try {
      await axios.post(`${BASE_URL}/evaluations/generate`, {
        profession: 'Frontend Developer',
        technology: 'JavaScript',
        projectId: projectId
      }, { headers });
      console.log('❌ Second evaluation should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Límite')) {
        console.log('✅ Second evaluation correctly blocked:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    // 10. Test membership upgrade
    console.log('\n10. Testing membership upgrade...');
    const upgradeResponse = await axios.post(`${BASE_URL}/membership/upgrade`, {
      membershipType: 'PRO'
    }, { headers });
    
    console.log('✅ Membership upgraded:', upgradeResponse.data.message);
    
    // 11. Test evaluation generation after upgrade (should work now)  
    console.log('\n11. Testing evaluation generation after upgrade...');
    const postUpgradeResponse = await axios.post(`${BASE_URL}/evaluations/generate`, {
      profession: 'Frontend Developer',
      technology: 'JavaScript',
      projectId: projectId
    }, { headers });
    
    console.log('✅ Post-upgrade evaluation generation successful:', postUpgradeResponse.data.questions.length, 'questions');
    
    console.log('\n🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Run the API test
testMembershipAPI()
  .then(() => {
    console.log('\n✅ All API tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ API test failed:', error);
    process.exit(1);
  });
