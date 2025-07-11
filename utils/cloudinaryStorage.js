import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';
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
    const base64String = `data:application/octet-stream;base64,${content.toString(
      'base64'
    )}`;

    // Determine if it's an image or raw file based on extension
    const extension = blobName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const resourceType = imageExtensions.includes(extension) ? 'image' : 'raw';

    console.log(`📤 Uploading ${blobName} as resource type: ${resourceType}`);

    const result = await cloudinary.uploader.upload(base64String, {
      public_id: `${containerName}/${blobName}`,
      resource_type: resourceType,
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

// Download from Cloudinary and save to file (legacy function - still used for compatibility)
export async function downloadBlobToFile(
  blobName,
  fileNameWithPath,
  containerName
) {
  try {
    const publicId = `${containerName}/${blobName}`;

    console.log(`🔍 Cloudinary download - Public ID: ${publicId}`);

    // Determine if it's an image or raw file based on extension
    const extension = blobName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const resourceType = imageExtensions.includes(extension) ? 'image' : 'raw';

    console.log(`📥 Downloading ${blobName} as resource type: ${resourceType}`);

    // Get the file URL from Cloudinary
    const fileUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: 'upload',
    });

    console.log(`Attempting to download from URL: ${fileUrl}`);

    // Download the file using fetch
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText}`
      );
    }

    const buffer = await response.arrayBuffer();
    const fs = await import('fs');

    // Ensure directory exists
    const path = await import('path');
    const dir = path.dirname(fileNameWithPath);
    fs.mkdirSync(dir, { recursive: true });

    // Write to local file
    fs.writeFileSync(fileNameWithPath, Buffer.from(buffer));
    console.log(
      `📥 Download of ${blobName} success - saved to ${fileNameWithPath}`
    );

    return { success: true, url: fileUrl };
  } catch (error) {
    console.error(`❌ Error downloading ${blobName}:`, error);
    throw error;
  }
}

// Download from Cloudinary and return as buffer (for streaming)
export async function downloadBlobAsBuffer(blobName, containerName) {
  try {
    const publicId = `${containerName}/${blobName}`;

    console.log(`🔍 Cloudinary download buffer - Public ID: ${publicId}`);

    // Determine if it's an image or raw file based on extension
    const extension = blobName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const resourceType = imageExtensions.includes(extension) ? 'image' : 'raw';

    console.log(`📥 Downloading ${blobName} as resource type: ${resourceType}`);

    // Get the file URL from Cloudinary
    const fileUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: 'upload',
    });

    console.log(`Attempting to download from URL: ${fileUrl}`);

    // Download the file using fetch
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText}`
      );
    }

    const buffer = await response.arrayBuffer();
    console.log(
      `📥 Download of ${blobName} success - buffer size: ${buffer.byteLength} bytes`
    );

    return Buffer.from(buffer);
  } catch (error) {
    console.error(`❌ Error downloading ${blobName}:`, error);
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
    console.log(`Attempting to delete: ${publicId}`);

    // Determine if it's an image or raw file based on extension
    const extension = blobName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const resourceType = imageExtensions.includes(extension) ? 'image' : 'raw';

    console.log(`🗑️ Deleting ${blobName} as resource type: ${resourceType}`);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log(`Delete result:`, result);

    if (result.result === 'ok' || result.result === 'not found') {
      console.log(`✅ Deletion of ${blobName} successful`);
      return { success: true };
    } else {
      throw new Error(`Failed to delete file: ${result.result}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting ${blobName}:`, error);
    throw error;
  }
}
