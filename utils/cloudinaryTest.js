import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection successful:', result);
  } catch (error) {
    console.error('Cloudinary connection failed:', error);
  }
}

// Example upload function
async function testUpload(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'test-uploads',
      resource_type: 'auto',
    });
    console.log('Upload successful:', result.public_id);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// Example delete function
async function testDelete(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Delete result:', result);
    return result;
  } catch (error) {
    console.error('Delete failed:', error);
  }
}

// Test buffer upload (simulates file upload from API)
async function testBufferUpload() {
  try {
    const testData = 'This is test file content for Cloudinary upload';
    const buffer = Buffer.from(testData);
    const base64String = `data:text/plain;base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64String, {
      public_id: 'test-uploads/buffer-test.txt',
      resource_type: 'auto',
      use_filename: false,
    });

    console.log('✅ Buffer upload successful:', result.public_id);
    console.log('   URL:', result.secure_url);
    return result;
  } catch (error) {
    console.error('❌ Buffer upload failed:', error.message);
    return null;
  }
}

// Test user folder creation
async function testUserFolderCreation(userId) {
  try {
    const testData = `Test file for user ${userId}`;
    const buffer = Buffer.from(testData);
    const base64String = `data:text/plain;base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64String, {
      public_id: `user-${userId}/test-file`,
      resource_type: 'auto',
      use_filename: false,
    });

    console.log(
      `✅ User folder creation successful for user-${userId}:`,
      result.public_id
    );
    return result;
  } catch (error) {
    console.error(
      `❌ User folder creation failed for user-${userId}:`,
      error.message
    );
    return null;
  }
}

// Test file listing for a user folder
async function testListUserFiles(userId) {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: `user-${userId}/`,
      max_results: 10,
    });

    console.log(
      `✅ Found ${result.resources.length} files for user-${userId}:`
    );
    result.resources.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.public_id} (${file.bytes} bytes)`);
    });
    return result;
  } catch (error) {
    console.error(`❌ Failed to list files for user-${userId}:`, error.message);
    return null;
  }
}

// Test quota and usage information
async function testUsageInfo() {
  try {
    const result = await cloudinary.api.usage();
    console.log('✅ Usage Information:');
    console.log(
      `   Storage: ${(result.storage.used_bytes / 1024 / 1024).toFixed(
        2
      )} MB used`
    );
    console.log(
      `   Bandwidth: ${(result.bandwidth.used_bytes / 1024 / 1024).toFixed(
        2
      )} MB used this month`
    );
    console.log(
      `   Transformations: ${result.transformations.used} used this month`
    );
    return result;
  } catch (error) {
    console.error('❌ Failed to get usage info:', error.message);
    return null;
  }
}

// Comprehensive test suite
async function runComprehensiveTests() {
  console.log('🧪 Starting Comprehensive Cloudinary Tests...\n');

  // Test 1: Connection
  console.log('1️⃣ Testing Connection...');
  await testCloudinaryConnection();

  // Test 2: Buffer Upload (simulates API usage)
  console.log('\n2️⃣ Testing Buffer Upload...');
  const uploadResult = await testBufferUpload();

  // Test 3: User Folder Creation
  console.log('\n3️⃣ Testing User Folder Creation...');
  const testUserId = 'test123';
  await testUserFolderCreation(testUserId);

  // Test 4: List Files
  console.log('\n4️⃣ Testing File Listing...');
  await testListUserFiles(testUserId);

  // Test 5: Usage Information
  console.log('\n5️⃣ Testing Usage Information...');
  await testUsageInfo();

  // Test 6: Cleanup
  if (uploadResult) {
    console.log('\n6️⃣ Testing File Deletion...');
    await testDelete(uploadResult.public_id);
    await testDelete(`user-${testUserId}/test-file`);
  }

  console.log('\n🎉 Comprehensive tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Start your server: npm start');
  console.log('   2. Test the API endpoints with Postman');
  console.log('   3. Check the TESTING_GUIDE.md for detailed instructions');
}

// Example usage
(async () => {
  try {
    // Run comprehensive test suite
    await runComprehensiveTests();

    // Individual tests (uncomment as needed):
    // await testCloudinaryConnection();
    // const uploadResult = await testUpload('./my-file.txt');
    // await testDelete('test-uploads/my-file');
  } catch (error) {
    console.error('Error:', error);
  }
})();

// Export for testing
export {
  testCloudinaryConnection,
  testUpload,
  testDelete,
  testBufferUpload,
  testUserFolderCreation,
  testListUserFiles,
  testUsageInfo,
  runComprehensiveTests,
};
