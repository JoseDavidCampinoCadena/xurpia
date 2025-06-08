const axios = require('axios');

async function testUsersMeEndpoint() {
  try {
    console.log('🔐 Testing /users/me endpoint with JWT authentication...');
    
    // First register a user to get a valid JWT token
    const registerResponse = await axios.post('http://localhost:3001/auth/register', {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User'
    });
    
    console.log('✅ Registration successful');
    const token = registerResponse.data.token;
    console.log('🔑 JWT Token:', token.substring(0, 50) + '...');
    
    // Now test the /users/me endpoint
    const meResponse = await axios.get('http://localhost:3001/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ /users/me endpoint successful!');
    console.log('👤 User data:', meResponse.data);
    console.log('📊 Response status:', meResponse.status);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('📊 Response status:', error.response?.status);
    if (error.response?.headers) {
      console.error('📋 Response headers:', error.response.headers);
    }
  }
}

testUsersMeEndpoint();
