import { downloadBlobAsBuffer } from './utils/cloudinaryStorage.js';

console.log('Testing downloadBlobAsBuffer function...');

try {
  // Test if the function exists
  console.log('Function exists:', typeof downloadBlobAsBuffer);
  console.log('Test completed successfully');
} catch (error) {
  console.error('Error:', error.message);
}
