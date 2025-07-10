# 🧪 Complete Testing Documentation for Cloudinary Migration

## Quick Start Testing

### 1. **Environment Setup** (Required)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Get Cloudinary credentials (free account)
# Visit: https://cloudinary.com/
# Add your credentials to .env file
```

### 2. **Test Cloudinary Connection**

```bash
# Test basic Cloudinary connectivity
node utils/cloudinaryTest.js
```

**Expected Output:**

```
🧪 Starting Comprehensive Cloudinary Tests...
1️⃣ Testing Connection...
✅ Cloudinary connection successful: { status: 'ok' }
2️⃣ Testing Buffer Upload...
✅ Buffer upload successful: test-uploads/buffer-test.txt
...
🎉 Comprehensive tests completed!
```

### 3. **Test Full API (End-to-End)**

```bash
# Terminal 1: Start your server
npm start

# Terminal 2: Run API tests
node utils/apiTest.js
```

## Testing Methods Overview

| Method                | What it Tests                            | When to Use                      |
| --------------------- | ---------------------------------------- | -------------------------------- |
| **cloudinaryTest.js** | Cloudinary connectivity & core functions | First - verify Cloudinary setup  |
| **apiTest.js**        | Full API endpoints (auth + files)        | Second - test complete workflow  |
| **Manual Testing**    | UI/UX and edge cases                     | Final - validate user experience |

## Detailed Testing Procedures

### Method 1: Cloudinary Core Testing

**File:** `utils/cloudinaryTest.js`

**Tests:**

- ✅ Connection to Cloudinary
- ✅ Buffer upload (simulates API usage)
- ✅ User folder creation
- ✅ File listing
- ✅ Usage/quota information
- ✅ File deletion

**Run:**

```bash
node utils/cloudinaryTest.js
```

### Method 2: API Endpoint Testing

**File:** `utils/apiTest.js`

**Complete Workflow Test:**

1. **User Registration** - Creates new user + Cloudinary folder
2. **User Login** - Authenticates and gets JWT token
3. **File Upload** - Uploads test file to user's folder
4. **File Download** - Downloads the uploaded file
5. **File Deletion** - Removes file from Cloudinary
6. **Security Test** - Verifies unauthorized access is blocked

**Run:**

```bash
# Start server first
npm start

# In another terminal
node utils/apiTest.js
```

**Expected Results:**

```
📊 Test Results Summary:
========================
Registration: ✅ PASS
Login:        ✅ PASS
Upload:       ✅ PASS
Download:     ✅ PASS
Delete:       ✅ PASS
Security:     ✅ PASS

🎯 Overall: 6/6 tests passed
🎉 All tests passed! Your API is working correctly.
```

### Method 3: Manual Testing with Postman

**Collection Setup:**

1. **Base URL:** `http://localhost:3000/api/v1`
2. **Auth Token:** Store JWT in environment variable

**Test Sequence:**

#### 1. Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

#### 2. Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

_Save the `token` from response_

#### 3. Upload File

```http
POST /files/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: [Select any file]
```

#### 4. Download File

```http
GET /files/YOUR_FILE_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 5. Delete File

```http
DELETE /files/YOUR_FILE_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

## Verification & Monitoring

### 1. **Cloudinary Dashboard Verification**

**Check:**

- 📁 User folders: `user-{userId}`
- 📊 Storage usage
- 🌐 File URLs and accessibility
- 📈 Bandwidth consumption

**Location:** https://console.cloudinary.com/

### 2. **File Organization Verification**

**Expected Structure:**

```
📁 Cloudinary Media Library
├── 📁 user-60f7b1b5c8f4d5001f123456/
│   ├── 📄 uploaded_file_1.jpg
│   ├── 📄 document.pdf
│   └── 📄 another_file.png
├── 📁 user-60f7b1b5c8f4d5001f789012/
│   ├── 📄 their_file.jpg
│   └── 📄 different_doc.pdf
└── 📁 test-uploads/ (from testing)
    └── 📄 buffer-test.txt
```

## Advanced Testing Scenarios

### Load Testing (Optional)

```javascript
// utils/loadTest.js
import { uploadToBlob } from './cloudinaryStorage.js';

async function loadTest() {
  const promises = [];
  for (let i = 0; i < 10; i++) {
    const testData = Buffer.from(`Test file ${i}`);
    promises.push(uploadToBlob(testData, `load-test-${i}.txt`, 'load-test'));
  }

  await Promise.all(promises);
  console.log('✅ Load test completed');
}

loadTest();
```

### Multi-User Testing

1. Register 3-5 different users
2. Upload files for each user
3. Verify file isolation
4. Test cross-user access restrictions

### File Type Testing

Test with various formats:

- **Images:** `.jpg`, `.png`, `.gif`, `.webp`
- **Documents:** `.pdf`, `.docx`, `.txt`, `.csv`
- **Videos:** `.mp4`, `.avi` (small files)
- **Archives:** `.zip`, `.rar`

## Troubleshooting Guide

### Common Issues & Solutions

#### ❌ "Cloudinary connection failed"

**Causes:**

- Invalid credentials
- Network connectivity
- Environment variables not loaded

**Solutions:**

```bash
# Check environment variables
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY

# Verify .env file location
ls -la .env

# Test connection manually
node -e "
require('dotenv').config();
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
"
```

#### ❌ "Upload failed: Request failed with status code 401"

**Causes:**

- Invalid API credentials
- Incorrect authentication setup

**Solutions:**

- Double-check API key and secret
- Verify credentials haven't expired
- Check Cloudinary dashboard for account status

#### ❌ "ENOTFOUND" or network errors

**Causes:**

- Firewall blocking requests
- Corporate network restrictions
- DNS issues

**Solutions:**

- Try from different network
- Check corporate firewall settings
- Verify internet connectivity

#### ❌ Files not appearing in expected folders

**Causes:**

- Public ID formatting issues
- Folder creation logic problems

**Solutions:**

```javascript
// Debug the upload function
console.log('Public ID:', `${containerName}/${blobName}`);
console.log('Folder:', containerName);
```

### Performance Issues

#### Slow Upload/Download

**Check:**

- File sizes (keep under 10MB for testing)
- Network bandwidth
- Cloudinary region (closer = faster)

#### High Bandwidth Usage

**Monitor:**

- Cloudinary dashboard usage stats
- File compression settings
- Download frequency patterns

## Success Criteria Checklist

- [ ] ✅ `cloudinaryTest.js` runs without errors
- [ ] ✅ `apiTest.js` shows 6/6 tests passed
- [ ] ✅ Files appear correctly in Cloudinary dashboard
- [ ] ✅ User folders are isolated (users can't access each other's files)
- [ ] ✅ All file types upload successfully
- [ ] ✅ Downloads work and return correct files
- [ ] ✅ Deletions remove files from Cloudinary
- [ ] ✅ Authentication prevents unauthorized access
- [ ] ✅ No Azure-related errors in console/logs

## Next Steps After Testing

### 1. **Production Deployment**

- Set up production Cloudinary account
- Update environment variables
- Test with production data

### 2. **Enhanced Features**

- Add file compression
- Implement image transformations
- Set up file versioning
- Add batch operations

### 3. **Monitoring Setup**

- Error logging and alerting
- Performance monitoring
- Usage analytics
- Automated testing pipeline

## Testing Automation

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test API
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: node utils/cloudinaryTest.js
    env:
      CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
      CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
      CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
```

## Support Resources

- **Cloudinary Documentation:** https://cloudinary.com/documentation
- **API Reference:** https://cloudinary.com/documentation/image_upload_api_reference
- **Community Forum:** https://community.cloudinary.com/
- **Status Page:** https://status.cloudinary.com/

---

**🎉 Your Cloudinary migration is complete!**

This testing documentation ensures your file storage system is robust, secure, and ready for production use.
