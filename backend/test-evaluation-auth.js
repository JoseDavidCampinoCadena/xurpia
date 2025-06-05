const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testEvaluationWithAuth() {
  try {
    console.log('🔐 Step 1: Attempting login...');
      // Try to login with existing user
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'jorge@gmail.com',
      password: '123456' // Common test password
    });

    console.log('✅ Login successful!', {
      status: loginResponse.status,
      hasToken: !!loginResponse.data.token,
      hasUser: !!loginResponse.data.user
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;

    console.log('👤 User info:', {
      id: user.id,
      email: user.email,
      name: user.name
    });

    // Configure axios with auth token
    const axiosWithAuth = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n🧠 Step 2: Testing question generation...');
    const questionsResponse = await axiosWithAuth.post('/evaluations/generate-questions', {
      profession: 'Software Developer',
      technology: 'JavaScript'
    });

    console.log('✅ Questions generated successfully:', {
      status: questionsResponse.status,
      questionCount: questionsResponse.data.length
    });

    const questions = questionsResponse.data;
    const userAnswers = questions.map(() => 0); // All answers are option 0

    console.log('\n📝 Step 3: Testing evaluation submission...');
    const submissionResponse = await axiosWithAuth.post('/evaluations/submit', {
      profession: 'Software Developer',
      technology: 'JavaScript',
      questions: questions,
      userAnswers: userAnswers
    });

    console.log('✅ Evaluation submitted successfully!', {
      status: submissionResponse.status,
      result: submissionResponse.data
    });

  } catch (error) {
    console.error('❌ Error occurred:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.log('\n🔑 Authentication failed. Let\'s try creating a new user or using different credentials...');
      
      try {        // Try registering a new user
        console.log('📝 Attempting to register new user...');
        const registerResponse = await axios.post(`${API_URL}/auth/register`, {
          email: 'testeval@example.com',
          password: 'password123',
          name: 'Test Evaluation User',
          profession: 'Software Developer'
        });

        console.log('✅ Registration successful!', {
          status: registerResponse.status,
          hasToken: !!registerResponse.data.token
        });

        // Retry with new user
        const newToken = registerResponse.data.token;
        const axiosWithNewAuth = axios.create({
          baseURL: API_URL,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('\n🧠 Retrying question generation with new user...');
        const retryQuestionsResponse = await axiosWithNewAuth.post('/evaluations/generate-questions', {
          profession: 'Software Developer',
          technology: 'JavaScript'
        });

        const retryQuestions = retryQuestionsResponse.data;
        const retryUserAnswers = retryQuestions.map(() => 0);

        console.log('\n📝 Retrying evaluation submission...');
        const retrySubmissionResponse = await axiosWithNewAuth.post('/evaluations/submit', {
          profession: 'Software Developer',
          technology: 'JavaScript',
          questions: retryQuestions,
          userAnswers: retryUserAnswers
        });

        console.log('✅ Evaluation submitted successfully with new user!', {
          status: retrySubmissionResponse.status,
          result: retrySubmissionResponse.data
        });

      } catch (retryError) {
        console.error('❌ Retry also failed:', {
          message: retryError.message,
          status: retryError.response?.status,
          data: retryError.response?.data
        });
      }
    }
  }
}

testEvaluationWithAuth();
