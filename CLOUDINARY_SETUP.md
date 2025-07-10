# Cloudinary Setup Guide

## Getting Your Cloudinary Credentials

### 1. Create Free Account

1. Go to https://cloudinary.com/
2. Click "Sign Up for Free"
3. Fill in your details (no credit card required)

### 2. Get Your Credentials

After logging in to your Cloudinary dashboard:

1. **Cloud Name**: Found at the top of your dashboard
2. **API Key**: Listed in the "Account Details" section
3. **API Secret**: Listed in the "Account Details" section (click the "eye" icon to reveal)

### 3. Add to Your .env File

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB per month
- **Transformations**: 25,000 per month
- **Admin API calls**: 500 per hour

## Testing Your Setup

Run the test utility to verify your connection:

```bash
node utils/cloudinaryTest.js
```

If successful, you should see: "Cloudinary connection successful"

## File Organization

Your files will be automatically organized like this in Cloudinary:

```
user-60f7b1b5c8f4d5001f123456/
  ├── uploaded_file_1.jpg
  ├── document.pdf
  └── another_file.png
```

Each user gets their own folder automatically when they register.
