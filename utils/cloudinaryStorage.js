import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a folder for a user after they register
export async function createUserContainer(userId) {
  // In Cloudinary, folders are created automatically when you upload files
  // No need to explicitly create folders, but we can validate the configuration
  try {
    await cloudinary.api.ping();
    console.log(`User folder ${userId} ready for uploads in Cloudinary`);
    return { success: true };
  } catch (error) {
    console.error(`Error setting up Cloudinary for user ${userId}:`, error);
    throw error;
  }
}

// Upload to user folder in Cloudinary
export async function uploadToBlob(content, blobName, containerName) {
  try {
    // Convert buffer to base64 for Cloudinary upload
    const base64String = `data:application/octet-stream;base64,${content.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64String, {
      public_id: `${containerName}/${blobName}`,
      folder: containerName,
      resource_type: 'auto', // Automatically detect file type
      use_filename: true,
      unique_filename: false,
    });
    
    console.log(`Upload file ${blobName} successfully`, result.public_id);
    return result;
  } catch (error) {
    console.error(`Error uploading ${blobName}:`, error);
    throw error;
  }
}

// Download from Cloudinary (returns the file URL)
export async function downloadBlobToFile(blobName, fileNameWithPath, containerName) {
  try {
    const publicId = `${containerName}/${blobName}`;
    
    // Get the file URL from Cloudinary
    const fileUrl = cloudinary.url(publicId, {
      resource_type: 'auto',
      type: 'upload',
    });
    
    // Download the file using fetch
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const fs = await import('fs');
    
    // Write to local file
    fs.writeFileSync(fileNameWithPath, Buffer.from(buffer));
    console.log(`Download of ${blobName} success`);
    
    return { success: true, url: fileUrl };
  } catch (error) {
    console.error(`Error downloading ${blobName}:`, error);
    throw error;
  }
}

// Delete from Cloudinary
export async function deleteBlob(blobName, containerName) {
  if (!blobName) {
    throw new Error('Blob name is undefined');
  }
  
  try {
    const publicId = `${containerName}/${blobName}`;
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
    });
    
    if (result.result === 'ok') {
      console.log(`Deletion of ${blobName} successful`);
      return { success: true };
    } else {
      throw new Error(`Failed to delete file: ${result.result}`);
    }
  } catch (error) {
    console.error(`Error deleting ${blobName}:`, error);
    throw error;
  }
}
