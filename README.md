# Kaleidoscope API

A Node.js file management API with user authentication and cloud storage using Cloudinary.

## Features

- User authentication (register/login)
- File upload, download, and deletion
- User-specific file storage using Cloudinary folders
- Secure file access with JWT tokens

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. Get your **Cloud Name**, **API Key**, and **API Secret** from your dashboard
3. Free tier includes: 25GB storage and 25GB bandwidth per month

### 3. Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your environment variables:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_LIFETIME=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Run the Application

```bash
npm start
```

## Migration from Azure

This project has been migrated from Azure Blob Storage to Cloudinary for the following benefits:

- **Free tier**: 25GB storage vs Azure's limited free tier
- **Easy setup**: No complex connection strings
- **Better API**: More intuitive file management
- **Built-in optimizations**: Automatic image optimization and transformations

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Files (Requires Authentication)

- `POST /api/v1/files/upload` - Upload file
- `GET /api/v1/files/:fileId` - Download file
- `DELETE /api/v1/files/:fileId` - Delete file

## File Storage Structure

Files are organized in Cloudinary using the following structure:

```
user-{userId}/
  ├── file1.jpg
  ├── document.pdf
  └── ...
```

Each user gets their own folder automatically created upon registration.
