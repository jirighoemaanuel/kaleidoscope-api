import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.CONNECTIONSTRING;

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

async function createContainer(containerName) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const createContainerResponse = await containerClient.createIfNotExists();
    if (createContainerResponse.statusCode === 201) {
      console.log('Container created successfully.');
    } else {
      console.log('Container already exists.');
    }
  } catch (error) {
    console.error('Error creating container:', error);
  }
}

async function uploadBlob(containerName, blobName, filePath) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    const uploadBlobResponse = await blobClient.uploadFile(filePath);
    console.log('Blob uploaded successfully:', uploadBlobResponse.requestId);
  } catch (error) {
    console.error('Error uploading blob:', error);
  }
}

async function downloadBlob(containerName, blobName, downloadPath) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    const downloadResponse = await blobClient.downloadToFile(downloadPath);
    console.log('Blob downloaded successfully:', downloadResponse.requestId);
  } catch (error) {
    console.error('Error downloading blob:', error);
  }
}

(async () => {
  const containerName = 'my-container';
  const blobName = 'my-blob';
  const filePath = './my-file.txt';
  const downloadPath = './downloaded-file.txt';

  try {
    await createContainer(containerName);
    await uploadBlob(containerName, blobName, filePath);
    await downloadBlob(containerName, blobName, downloadPath);
  } catch (error) {
    console.error('Error:', error);
  }
})();
