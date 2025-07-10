// API Testing Script for Kaleidoscope File Management
// Run this after starting your server with: npm start

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';

// Test user credentials
const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
};

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };

  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    console.log(`${options.method || 'GET'} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('---');

    return { response, data };
  } catch (error) {
    console.error(`❌ Request failed: ${endpoint}`, error.message);
    return { error };
  }
}

// Test 1: Register user
async function testRegister() {
  console.log('1️⃣ Testing User Registration...');

  const { response, data } = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser),
  });

  if (response?.status === 201) {
    authToken = data.token;
    console.log('✅ Registration successful!');
    console.log(`Auth token: ${authToken.substring(0, 20)}...`);
  } else {
    console.log('❌ Registration failed');
  }

  console.log('');
  return response?.status === 201;
}

// Test 2: Login user
async function testLogin() {
  console.log('2️⃣ Testing User Login...');

  const { response, data } = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });

  if (response?.status === 200) {
    authToken = data.token;
    console.log('✅ Login successful!');
  } else {
    console.log('❌ Login failed');
  }

  console.log('');
  return response?.status === 200;
}

// Test 3: Upload file
async function testFileUpload() {
  console.log('3️⃣ Testing File Upload...');

  // Create a test file
  const testFilePath = './test-upload.txt';
  const testContent = `Test file uploaded at ${new Date().toISOString()}`;
  fs.writeFileSync(testFilePath, testContent);

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));

    const response = await fetch(`${BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: form,
    });

    const data = await response.json();

    console.log(`POST /files/upload`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('---');

    // Clean up test file
    fs.unlinkSync(testFilePath);

    if (response.status === 201) {
      console.log('✅ File upload successful!');
      return data.file;
    } else {
      console.log('❌ File upload failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    return null;
  }
}

// Test 4: Download file
async function testFileDownload(fileId) {
  if (!fileId) {
    console.log('⏭️ Skipping download test - no file ID');
    return false;
  }

  console.log('4️⃣ Testing File Download...');

  try {
    const response = await fetch(`${BASE_URL}/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log(`GET /files/${fileId}`);
    console.log(`Status: ${response.status}`);

    if (response.status === 200) {
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      console.log('✅ File download successful!');
      console.log('---');
      return true;
    } else {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('❌ File download failed');
      console.log('---');
      return false;
    }
  } catch (error) {
    console.error('❌ Download error:', error.message);
    return false;
  }
}

// Test 5: Delete file
async function testFileDelete(fileId) {
  if (!fileId) {
    console.log('⏭️ Skipping delete test - no file ID');
    return false;
  }

  console.log('5️⃣ Testing File Deletion...');

  const { response, data } = await apiRequest(`/files/${fileId}`, {
    method: 'DELETE',
  });

  if (response?.status === 200) {
    console.log('✅ File deletion successful!');
    return true;
  } else {
    console.log('❌ File deletion failed');
    return false;
  }
}

// Test 6: Unauthorized access
async function testUnauthorizedAccess() {
  console.log('6️⃣ Testing Unauthorized Access...');

  const originalToken = authToken;
  authToken = 'invalid_token';

  const { response } = await apiRequest('/files/upload', {
    method: 'POST',
    body: JSON.stringify({}),
  });

  authToken = originalToken;

  if (response?.status === 401) {
    console.log('✅ Unauthorized access properly blocked!');
    return true;
  } else {
    console.log('❌ Security issue: unauthorized access allowed');
    return false;
  }
}

// Main test runner
async function runApiTests() {
  console.log('🚀 Starting API Tests for Kaleidoscope File Management\n');
  console.log('Make sure your server is running: npm start\n');

  const results = {
    register: false,
    login: false,
    upload: false,
    download: false,
    delete: false,
    security: false,
  };

  let uploadedFile = null;

  try {
    // Test registration
    results.register = await testRegister();

    // Test login (skip if registration failed)
    if (results.register) {
      results.login = await testLogin();
    }

    // Test file operations (skip if login failed)
    if (results.login) {
      uploadedFile = await testFileUpload();
      results.upload = !!uploadedFile;

      if (uploadedFile) {
        // Extract file ID for subsequent tests
        const fileId = uploadedFile.filename || uploadedFile._id;
        results.download = await testFileDownload(fileId);
        results.delete = await testFileDelete(fileId);
      }

      results.security = await testUnauthorizedAccess();
    }

    // Print summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`Registration: ${results.register ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Login:        ${results.login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Upload:       ${results.upload ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Download:     ${results.download ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Delete:       ${results.delete ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Security:     ${results.security ? '✅ PASS' : '❌ FAIL'}`);

    const passCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`);

    if (passCount === totalTests) {
      console.log('🎉 All tests passed! Your API is working correctly.');
      console.log('\n📋 Next Steps:');
      console.log('   1. Check your Cloudinary dashboard for uploaded files');
      console.log('   2. Try testing with different file types');
      console.log('   3. Test with multiple users');
      console.log('   4. Consider setting up automated testing');
    } else {
      console.log('⚠️  Some tests failed. Check the logs above for details.');
    }
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Export for use in other files
export {
  runApiTests,
  testRegister,
  testLogin,
  testFileUpload,
  testFileDownload,
  testFileDelete,
  testUnauthorizedAccess,
};

// Run tests if this file is executed directly
// Fix Windows path comparison issue
const currentFile = import.meta.url;
const executedFile = `file:///${process.argv[1].replace(/\\/g, '/')}`;

if (currentFile === executedFile) {
  runApiTests();
}
