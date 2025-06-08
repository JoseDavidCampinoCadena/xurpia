const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCompleteEvaluationFlow() {
  console.log('🚀 Testing complete evaluation flow with membership validation...\n');

  try {
    // Step 1: Login to get auth token
    console.log('1. 🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Login successful. User ID: ${userId}`);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get user projects
    console.log('\n2. 📋 Getting user projects...');
    const projectsResponse = await axios.get(`${BASE_URL}/projects`, { headers });
    const projects = projectsResponse.data;
    console.log(`✅ Found ${projects.length} projects`);
    
    if (projects.length === 0) {
      console.log('❌ No projects found. User needs at least one project to perform evaluations.');
      return;
    }

    const projectId = projects[0].id;
    console.log(`📋 Using project: ${projects[0].name} (ID: ${projectId})`);

    // Step 3: Check current membership and existing evaluations
    console.log('\n3. 👤 Checking membership status...');
    const userResponse = await axios.get(`${BASE_URL}/users/me`, { headers });
    const user = userResponse.data;
    console.log(`✅ User membership: ${user.membershipType}`);

    const evaluationsResponse = await axios.get(`${BASE_URL}/evaluations/user/${userId}`, { headers });
    const existingEvaluations = evaluationsResponse.data;
    console.log(`📊 Existing evaluations: ${existingEvaluations.length}`);

    // Step 4: Generate questions for a technology
    const technology = 'JavaScript';
    const profession = 'Frontend Developer';
    
    console.log(`\n4. ❓ Generating questions for ${technology}...`);
    const questionsResponse = await axios.post(`${BASE_URL}/evaluations/generate-questions`, {
      profession,
      technology
    }, { headers });

    const questions = questionsResponse.data;
    console.log(`✅ Generated ${questions.length} questions`);

    // Step 5: Submit evaluation with projectId
    console.log(`\n5. 📝 Submitting evaluation for project ${projectId}...`);
    
    // Create sample answers (50% correct for testing)
    const userAnswers = questions.map((_, index) => index % 2 === 0 ? 0 : 1);
    
    try {
      const evaluationResponse = await axios.post(`${BASE_URL}/evaluations/submit`, {
        profession,
        technology,
        questions,
        userAnswers,
        projectId // This is the key addition for membership validation
      }, { headers });

      const result = evaluationResponse.data;
      console.log(`✅ Evaluation submitted successfully!`);
      console.log(`📊 Score: ${result.score}/100`);
      console.log(`🎯 Level: ${result.level}`);
      console.log(`💬 Feedback: ${result.feedback}`);

      // Step 6: Try to submit another evaluation (should check limits)
      console.log(`\n6. 🔄 Testing membership limits - submitting another evaluation...`);
      
      try {
        const secondEvaluation = await axios.post(`${BASE_URL}/evaluations/submit`, {
          profession,
          technology,
          questions,
          userAnswers,
          projectId
        }, { headers });

        console.log(`✅ Second evaluation allowed. Result: ${secondEvaluation.data.score}/100`);
      } catch (limitError) {
        if (limitError.response && limitError.response.status === 400) {
          console.log(`🚫 Membership limit reached: ${limitError.response.data.message}`);
          console.log('✅ Membership validation working correctly!');
        } else {
          throw limitError;
        }
      }

    } catch (evaluationError) {
      if (evaluationError.response && evaluationError.response.status === 400) {
        console.log(`🚫 Evaluation blocked: ${evaluationError.response.data.message}`);
        console.log('✅ Membership validation working correctly!');
      } else {
        throw evaluationError;
      }
    }

    // Step 7: Check final evaluation count
    console.log('\n7. 📈 Final evaluation count...');
    const finalEvaluations = await axios.get(`${BASE_URL}/evaluations/user/${userId}`, { headers });
    console.log(`📊 Total evaluations now: ${finalEvaluations.data.length}`);

    console.log('\n🎉 Complete evaluation flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCompleteEvaluationFlow();
