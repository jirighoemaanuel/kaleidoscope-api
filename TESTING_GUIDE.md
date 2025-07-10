# Testing Guide for Cloudinary File Storage API

This guide will walk you through testing your migrated file storage API using Cloudinary.

## Prerequisites

1. **Cloudinary Account Setup**

   - Free account at https://cloudinary.com/
   - Get your credentials from the dashboard
   - Update your `.env` file with credentials

2. **Environment Setup**

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_here
   JWT_LIFETIME=30d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Testing Methods

### Method 1: Unit Testing with cloudinaryTest.js

Test your Cloudinary connection and basic functionality:

```bash
# Navigate to the project root
cd c:\Users\HP\OneDrive\Desktop\kaleidoscope-api

# Run the test script
node utils/cloudinaryTest.js
```

**Expected Output:**

```
Cloudinary connection successful: { status: 'ok' }
```

### Method 2: API Testing with Postman/Thunder Client

#### Step 1: Start the Server

```bash
npm start
```

#### Step 2: Test User Registration

**POST** `http://localhost:3000/api/v1/auth/register`

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**

```json
{
  "user": {
    "name": "Test User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Step 3: Test User Login

**POST** `http://localhost:3000/api/v1/auth/login`

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Step 4: Test File Upload

**POST** `http://localhost:3000/api/v1/files/upload`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (form-data):**

- Key: `file`
- Type: File
- Value: Select any file from your computer

**Expected Response:**

```json
{
  "msg": "File [filename] uploaded successfully",
  "file": {
    "_id": "...",
    "filename": "test-file.jpg",
    "size": 12345,
    "mimeType": "image/jpeg",
    "createdBy": "..."
  }
}
```

#### Step 5: Test File Download

**GET** `http://localhost:3000/api/v1/files/YOUR_FILE_ID`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response:**

- The actual file should download
- Status: 200 OK

#### Step 6: Test File Deletion

**DELETE** `http://localhost:3000/api/v1/files/YOUR_FILE_ID`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response:**

```json
{
  "msg": "File [file_id] deleted successfully"
}
```

### Method 3: Manual Testing with cURL

#### Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Upload File

```bash
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.jpg"
```

## Verification in Cloudinary Dashboard

1. **Login to Cloudinary Dashboard**

   - Go to https://console.cloudinary.com/
   - Navigate to "Media Library"

2. **Check File Organization**

   - Look for folders named `user-[userId]`
   - Verify uploaded files appear in the correct user folder
   - Check file metadata and URLs

3. **Monitor Usage**
   - Go to "Dashboard" → "Usage"
   - Monitor storage and bandwidth usage
   - Ensure you're within free tier limits (25GB storage, 25GB bandwidth)

## Testing Scenarios

### Scenario 1: Multiple Users

1. Register 2-3 different users
2. Upload files for each user
3. Verify files are isolated in separate folders
4. Ensure users can only access their own files

### Scenario 2: Different File Types

Test with various file types:

- Images: `.jpg`, `.png`, `.gif`
- Documents: `.pdf`, `.docx`, `.txt`
- Videos: `.mp4`, `.avi` (small files)
- Archives: `.zip`, `.rar`

### Scenario 3: Large Files

- Test with files close to your upload limit
- Monitor upload performance
- Check bandwidth usage in Cloudinary

### Scenario 4: Error Handling

- Test with invalid JWT tokens
- Try uploading without authentication
- Attempt to access other users' files
- Test with corrupted files

## Troubleshooting

### Common Issues and Solutions

#### 1. "Cloudinary connection failed"

**Cause:** Invalid credentials or network issues
**Solution:**

- Double-check your `.env` file
- Verify credentials in Cloudinary dashboard
- Check internet connection

#### 2. "Upload failed"

**Cause:** File too large or invalid format
**Solution:**

- Check file size (free tier has limits)
- Verify file format is supported
- Check Cloudinary dashboard for error details

#### 3. "Authentication failed"

**Cause:** Invalid or expired JWT token
**Solution:**

- Re-login to get a fresh token
- Check token format in Authorization header
- Verify JWT_SECRET in `.env`

#### 4. Files not appearing in Cloudinary

**Cause:** Folder/public_id naming issues
**Solution:**

- Check the upload function logs
- Verify folder structure in Cloudinary
- Check the public_id format

## Performance Testing

### Load Testing Setup

```javascript
// utils/loadTest.js
import { uploadToBlob } from './cloudinaryStorage.js';

async function loadTest() {
  const promises = [];
  const testData = Buffer.from('Test file content');

  for (let i = 0; i < 10; i++) {
    promises.push(uploadToBlob(testData, `test-${i}.txt`, 'load-test'));
  }

  try {
    await Promise.all(promises);
    console.log('Load test completed successfully');
  } catch (error) {
    console.error('Load test failed:', error);
  }
}

loadTest();
```

Run with:

```bash
node utils/loadTest.js
```

## Monitoring and Analytics

### Check Usage Statistics

1. **Cloudinary Dashboard**

   - Storage usage
   - Bandwidth consumption
   - API requests count

2. **Application Logs**
   - Monitor upload/download success rates
   - Track response times
   - Watch for error patterns

### Set Up Alerts

- Configure Cloudinary notifications for quota limits
- Monitor application logs for recurring errors
- Set up uptime monitoring for your API

## Success Criteria

Your migration is successful if:

- ✅ Cloudinary connection test passes
- ✅ User registration creates folders automatically
- ✅ File uploads work for all supported formats
- ✅ Files are properly organized by user
- ✅ Downloads work correctly
- ✅ File deletion removes files from Cloudinary
- ✅ Authentication prevents unauthorized access
- ✅ No Azure-related errors in logs

## Next Steps

After successful testing:

1. **Production Deployment**

   - Update production environment variables
   - Test with production Cloudinary account
   - Monitor performance under real load

2. **Optimization**

   - Implement file compression
   - Add image transformations
   - Set up CDN caching

3. **Features Enhancement**
   - Add file versioning
   - Implement batch operations
   - Add file sharing capabilities
