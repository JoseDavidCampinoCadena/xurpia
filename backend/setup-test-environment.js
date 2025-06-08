const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function setupTestUser() {
  console.log('🔧 Setting up test user...\n');

  try {    // Try to register a new test user
    console.log('1. 📝 Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'membership-test@example.com',
      password: 'test123456',
      name: 'Membership Test User',
      profession: 'Frontend Developer'
    });

    console.log('✅ Test user registered successfully');
    return registerResponse.data;
  } catch (error) {
    if (error.response && (error.response.status === 409 || (error.response.status === 400 && error.response.data.message.includes('already exists')))) {
      console.log('ℹ️ Test user already exists, trying to login...');
        try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'membership-test@example.com',
          password: 'test123456'
        });
        
        console.log('✅ Test user login successful');
        return loginResponse.data;
      } catch (loginError) {
        console.error('❌ Login failed:', loginError.response?.data || loginError.message);
        throw loginError;
      }
    } else {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

async function createTestProject(token, userId) {
  console.log('\n2. 📋 Creating test project...');
  
  try {
    const projectResponse = await axios.post(`${BASE_URL}/projects`, {
      name: 'Test Project for Evaluations',
      description: 'A test project for membership validation',
      logo: 'https://via.placeholder.com/100'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Test project created: ${projectResponse.data.name} (ID: ${projectResponse.data.id})`);
    return projectResponse.data;

  } catch (error) {
    console.error('❌ Project creation failed:', error.response?.data || error.message);
    throw error;
  }
}

async function setupTestEnvironment() {
  console.log('🚀 Setting up test environment for evaluation flow...\n');

  try {    // Step 1: Setup test user
    const authData = await setupTestUser();
    const token = authData.token;
    const userId = authData.user.id;

    // Step 2: Check if user has projects, create one if needed
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const projectsResponse = await axios.get(`${BASE_URL}/projects`, { headers });
    let projects = projectsResponse.data;

    if (projects.length === 0) {
      const newProject = await createTestProject(token, userId);
      projects = [newProject];
    } else {
      console.log(`\n2. ✅ Found existing projects: ${projects.length}`);
    }

    console.log('\n🎉 Test environment setup complete!');
    console.log(`👤 User ID: ${userId}`);
    console.log(`📋 Project ID: ${projects[0].id}`);
    console.log(`🔑 Token: ${token.substring(0, 20)}...`);

    return { token, userId, projectId: projects[0].id };

  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
    throw error;
  }
}

// Run the setup
setupTestEnvironment();
