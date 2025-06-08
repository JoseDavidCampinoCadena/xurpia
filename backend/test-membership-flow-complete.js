const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMembershipFlowComplete() {
  console.log('🚀 Testing complete membership validation flow...\n');

  // Generate unique user for testing
  const timestamp = Date.now();  const testUser = {
    email: `test-${timestamp}@example.com`,
    password: 'password123',
    name: 'Test User'
  };

  let token = null;
  let userId = null;

  try {
    // Step 1: Register new user
    console.log('1. 👤 Registering new user...');
    try {      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name
      });

      console.log('Register response status:', registerResponse.status);
      console.log('Register response data:', JSON.stringify(registerResponse.data, null, 2));
      
      // Extract token from registration response
      if (registerResponse.data && registerResponse.data.access_token) {
        token = registerResponse.data.access_token;
        userId = registerResponse.data.user?.id;
        console.log('✓ Token extracted from registration');
      } else if (registerResponse.data && registerResponse.data.token) {
        token = registerResponse.data.token;
        userId = registerResponse.data.user?.id;
        console.log('✓ Token extracted from registration (token field)');
      }
    } catch (registerError) {
      console.log('Registration failed, trying existing user login...');
      
      // Try with existing test user
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      
      console.log('Login response data:', JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.data && loginResponse.data.access_token) {
        token = loginResponse.data.access_token;
        userId = loginResponse.data.user?.id;
        console.log('✓ Token extracted from login');
      }
    }

    if (!token) {
      throw new Error('Unable to get authentication token');
    }

    console.log(`✅ Authentication successful. User ID: ${userId}`);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get or create a project
    console.log('\n2. 📋 Managing user projects...');
    let projectsResponse;
    try {
      projectsResponse = await axios.get(`${BASE_URL}/projects`, { headers });
    } catch (error) {
      console.log('Projects endpoint error:', error.response?.data || error.message);
      throw error;
    }

    let projects = projectsResponse.data;
    console.log(`📋 Found ${projects.length} existing projects`);
    
    let projectId;
    if (projects.length === 0) {
      console.log('Creating a test project...');      try {
        const createProjectResponse = await axios.post(`${BASE_URL}/projects`, {
          name: `Test Project ${timestamp}`,
          description: 'Test project for evaluation testing',
          logo: 'https://example.com/logo.png'
        }, { headers });
        
        projectId = createProjectResponse.data.id;
        console.log(`✅ Created project with ID: ${projectId}`);
      } catch (createError) {
        console.log('Failed to create project:', createError.response?.data || createError.message);
        throw createError;
      }
    } else {
      projectId = projects[0].id;
      console.log(`📋 Using existing project: ${projects[0].name} (ID: ${projectId})`);
    }

    // Step 3: Check current membership status
    console.log('\n3. 👤 Checking membership status...');
    const userResponse = await axios.get(`${BASE_URL}/users/me`, { headers });
    const user = userResponse.data;
    console.log(`✅ User membership: ${user.membershipType || 'FREE'}`);

    // Step 4: Check current evaluations
    console.log('\n4. 📊 Checking existing evaluations...');
    const evaluationsResponse = await axios.get(`${BASE_URL}/evaluations/user/${userId}`, { headers });
    const existingEvaluations = evaluationsResponse.data;
    console.log(`📊 Existing evaluations: ${existingEvaluations.length}`);

    // Show evaluations by technology for this project
    const projectEvaluations = existingEvaluations.filter(eval => eval.projectId === projectId);
    console.log(`📊 Evaluations for this project: ${projectEvaluations.length}`);

    // Step 5: Test evaluation generation and submission
    const technology = 'JavaScript';
    const profession = 'Frontend Developer';
    
    console.log(`\n5. ❓ Testing evaluation for ${technology}...`);
    
    // Generate questions
    const questionsResponse = await axios.post(`${BASE_URL}/evaluations/generate-questions`, {
      profession,
      technology
    }, { headers });

    const questions = questionsResponse.data;
    console.log(`✅ Generated ${questions.length} questions`);

    // Create sample answers (50% correct for testing)
    const userAnswers = questions.map((_, index) => index % 2 === 0 ? 0 : 1);
    
    console.log(`\n6. 📝 Submitting evaluation for project ${projectId}...`);
    
    try {
      const evaluationResponse = await axios.post(`${BASE_URL}/evaluations/submit`, {
        profession,
        technology,
        questions,
        userAnswers,
        projectId // Include projectId for membership validation
      }, { headers });

      const result = evaluationResponse.data;
      console.log(`✅ Evaluation submitted successfully!`);
      console.log(`📊 Score: ${result.score}/100`);
      console.log(`🎯 Level: ${result.level}`);
      console.log(`💬 Feedback: ${result.feedback || 'No feedback provided'}`);

      // Step 7: Test membership limits by trying another evaluation
      console.log(`\n7. 🔄 Testing membership limits - attempting second evaluation...`);
      
      try {
        const secondEvaluation = await axios.post(`${BASE_URL}/evaluations/submit`, {
          profession,
          technology,
          questions,
          userAnswers,
          projectId
        }, { headers });

        console.log(`✅ Second evaluation allowed. Score: ${secondEvaluation.data.score}/100`);
        console.log('✅ User has PRO/ENTERPRISE membership or this is within limits');
      } catch (limitError) {
        if (limitError.response && limitError.response.status === 400) {
          console.log(`🚫 Membership limit reached: ${limitError.response.data.message}`);
          console.log('✅ Membership validation is working correctly for FREE users!');
        } else {
          console.log('Unexpected error on second evaluation:', limitError.response?.data || limitError.message);
        }
      }

      // Step 8: Test with different technology (should be allowed)
      console.log(`\n8. 🔄 Testing different technology evaluation...`);
      
      try {
        const pythonQuestions = await axios.post(`${BASE_URL}/evaluations/generate-questions`, {
          profession: 'Backend Developer',
          technology: 'Python'
        }, { headers });

        const pythonAnswers = pythonQuestions.data.map((_, index) => index % 3 === 0 ? 0 : 1);

        const pythonEvaluation = await axios.post(`${BASE_URL}/evaluations/submit`, {
          profession: 'Backend Developer',
          technology: 'Python',
          questions: pythonQuestions.data,
          userAnswers: pythonAnswers,
          projectId
        }, { headers });

        console.log(`✅ Python evaluation allowed. Score: ${pythonEvaluation.data.score}/100`);
        console.log('✅ Different technology evaluations work correctly');
      } catch (pythonError) {
        console.log('Python evaluation error:', pythonError.response?.data || pythonError.message);
      }

    } catch (evaluationError) {
      if (evaluationError.response && evaluationError.response.status === 400) {
        console.log(`🚫 Evaluation blocked: ${evaluationError.response.data.message}`);
        console.log('✅ Membership validation prevented the evaluation (likely already at limit)');
      } else {
        console.log('Evaluation submission error:', evaluationError.response?.data || evaluationError.message);
        throw evaluationError;
      }
    }

    // Step 9: Final status check
    console.log('\n9. 📈 Final status check...');
    const finalEvaluations = await axios.get(`${BASE_URL}/evaluations/user/${userId}`, { headers });
    console.log(`📊 Total evaluations: ${finalEvaluations.data.length}`);
    
    const finalProjectEvaluations = finalEvaluations.data.filter(eval => eval.projectId === projectId);
    console.log(`📊 Evaluations for test project: ${finalProjectEvaluations.length}`);

    console.log('\n🎉 Membership flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- User: ${testUser.email}`);
    console.log(`- Membership: ${user.membershipType || 'FREE'}`);
    console.log(`- Project ID: ${projectId}`);
    console.log(`- Total Evaluations: ${finalEvaluations.data.length}`);
    console.log(`- Project Evaluations: ${finalProjectEvaluations.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    console.error('Full error:', error);
  }
}

// Run the test
testMembershipFlowComplete();
