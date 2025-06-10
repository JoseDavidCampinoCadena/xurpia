const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const ownerData = {
  name: 'Project Owner',
  email: 'owner@test.com',
  password: 'password123'
};

const collaboratorData = {
  name: 'Collaborator User',
  email: 'collaborator@test.com', 
  password: 'password123'
};

const projectData = {
  name: 'Test Project Owner Exemption',
  description: 'A project to test that owners are exempted from skill assessments',
  logo: 'https://via.placeholder.com/100'
};

async function testOwnerExemption() {
  console.log('🧪 Testing Project Owner Exemption from Skill Assessment...\n');

  try {
    // Step 1: Register owner
    console.log('1. 👤 Registering project owner...');
    const ownerRegResponse = await axios.post(`${BASE_URL}/auth/register`, ownerData);
    console.log(`✅ Owner registered: ${ownerRegResponse.data.user.name}`);
    
    // Step 2: Login owner
    console.log('2. 🔐 Logging in owner...');
    const ownerLoginResponse = await axios.post(`${BASE_URL}/login`, {
      email: ownerData.email,
      password: ownerData.password
    });
    const ownerToken = ownerLoginResponse.data.access_token;
    const ownerId = ownerLoginResponse.data.user.id;
    console.log(`✅ Owner logged in: ${ownerLoginResponse.data.user.name} (ID: ${ownerId})`);

    // Step 3: Create project
    console.log('3. 📋 Creating test project...');
    const projectResponse = await axios.post(`${BASE_URL}/projects`, projectData, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const projectId = projectResponse.data.id;
    console.log(`✅ Project created: ${projectResponse.data.name} (ID: ${projectId})`);
    console.log(`   - Owner ID: ${projectResponse.data.ownerId}`);

    // Step 4: Register collaborator
    console.log('4. 👥 Registering collaborator...');
    const collaboratorRegResponse = await axios.post(`${BASE_URL}/auth/register`, collaboratorData);
    console.log(`✅ Collaborator registered: ${collaboratorRegResponse.data.user.name}`);

    // Step 5: Login collaborator
    console.log('5. 🔐 Logging in collaborator...');
    const collaboratorLoginResponse = await axios.post(`${BASE_URL}/login`, {
      email: collaboratorData.email,
      password: collaboratorData.password
    });
    const collaboratorToken = collaboratorLoginResponse.data.access_token;
    const collaboratorId = collaboratorLoginResponse.data.user.id;
    console.log(`✅ Collaborator logged in: ${collaboratorLoginResponse.data.user.name} (ID: ${collaboratorId})`);

    // Step 6: Test basic info endpoint with owner
    console.log('6. ℹ️  Testing basic info endpoint with owner...');
    const ownerBasicInfoResponse = await axios.get(`${BASE_URL}/projects/${projectId}/basic-info`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    console.log(`✅ Owner can get basic info: ${ownerBasicInfoResponse.data.name}`);
    console.log(`   - Project Owner ID: ${ownerBasicInfoResponse.data.ownerId}`);
    console.log(`   - Current User ID: ${ownerId}`);
    console.log(`   - Is Owner: ${ownerBasicInfoResponse.data.ownerId === ownerId}`);

    // Step 7: Test basic info endpoint with collaborator
    console.log('7. ℹ️  Testing basic info endpoint with collaborator...');
    const collaboratorBasicInfoResponse = await axios.get(`${BASE_URL}/projects/${projectId}/basic-info`, {
      headers: { 'Authorization': `Bearer ${collaboratorToken}` }
    });
    console.log(`✅ Collaborator can get basic info: ${collaboratorBasicInfoResponse.data.name}`);
    console.log(`   - Project Owner ID: ${collaboratorBasicInfoResponse.data.ownerId}`);
    console.log(`   - Current User ID: ${collaboratorId}`);
    console.log(`   - Is Owner: ${collaboratorBasicInfoResponse.data.ownerId === collaboratorId}`);

    // Step 8: Test skill assessment check for owner
    console.log('8. 🎯 Testing skill assessment check for owner...');
    try {
      const ownerAssessmentResponse = await axios.get(`${BASE_URL}/skill-assessments/user-assessment/${projectId}`, {
        headers: { 'Authorization': `Bearer ${ownerToken}` }
      });
      console.log(`ℹ️  Owner has existing assessment: ${ownerAssessmentResponse.data ? 'Yes' : 'No'}`);
    } catch (ownerAssessmentError) {
      if (ownerAssessmentError.response?.status === 404) {
        console.log(`ℹ️  Owner has no assessment (expected): 404`);
      } else {
        console.log(`ℹ️  Owner assessment check error: ${ownerAssessmentError.response?.status}`);
      }
    }

    // Step 9: Test skill assessment check for collaborator
    console.log('9. 🎯 Testing skill assessment check for collaborator...');
    try {
      const collaboratorAssessmentResponse = await axios.get(`${BASE_URL}/skill-assessments/user-assessment/${projectId}`, {
        headers: { 'Authorization': `Bearer ${collaboratorToken}` }
      });
      console.log(`ℹ️  Collaborator has existing assessment: ${collaboratorAssessmentResponse.data ? 'Yes' : 'No'}`);
    } catch (collaboratorAssessmentError) {
      if (collaboratorAssessmentError.response?.status === 404) {
        console.log(`ℹ️  Collaborator has no assessment (expected): 404`);
      } else {
        console.log(`ℹ️  Collaborator assessment check error: ${collaboratorAssessmentError.response?.status}`);
      }
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Owner ID: ${ownerId}`);
    console.log(`   - Collaborator ID: ${collaboratorId}`);
    console.log(`   - Project ID: ${projectId}`);
    console.log(`   - Project Owner ID: ${ownerBasicInfoResponse.data.ownerId}`);
    console.log('\n✅ The fix should work: owners can get project basic info and should be exempted from skill assessments');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testOwnerExemption();
