const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1/auth';

async function testAuthEndpoints() {
    console.log('🧪 Testing Authentication Endpoints...\n');

    try {
        // Test 1: Register a new user
        console.log('1. Testing user registration...');
        const registerResponse = await axios.post(`${BASE_URL}/register`, {
            email: 'test@example.com',
            username: 'testuser',
            password: 'TestPassword123!',
            dateOfBirth: '2000-01-01'
        });

        console.log('✅ Registration successful');
        console.log('User ID:', registerResponse.data.data.user.id);
        console.log('Token received:', !!registerResponse.data.data.token);

        const token = registerResponse.data.data.token;

        // Test 2: Login with the registered user
        console.log('\n2. Testing user login...');
        const loginResponse = await axios.post(`${BASE_URL}/login`, {
            email: 'test@example.com',
            password: 'TestPassword123!'
        });

        console.log('✅ Login successful');
        console.log('Token received:', !!loginResponse.data.data.token);

        // Test 3: Get user profile
        console.log('\n3. Testing get profile...');
        const profileResponse = await axios.get(`${BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Profile fetch successful');
        console.log('User email:', profileResponse.data.data.email);
        console.log('User username:', profileResponse.data.data.username);

        // Test 4: Request password reset
        console.log('\n4. Testing password reset request...');
        const resetResponse = await axios.post(`${BASE_URL}/request-password-reset`, {
            email: 'test@example.com'
        });

        console.log('✅ Password reset request successful');
        console.log('Message:', resetResponse.data.message);

        console.log('\n🎉 All authentication endpoints are working correctly!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Run the tests
testAuthEndpoints();