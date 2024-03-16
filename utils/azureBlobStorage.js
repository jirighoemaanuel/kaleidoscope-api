import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.CONNECTIONSTRING;
const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
const containerName = 'my-container';

export async function uploadToBlob(content, blobName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadBlobResponse = await blockBlobClient.upload(
    content,
    content.length
  );
  console.log(
    `Upload block blob ${blobName} successfully`,
    uploadBlobResponse.requestId
  );
}

export async function downloadBlobToFile(blobName, fileNameWithPath) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  await blobClient.downloadToFile(fileNameWithPath);
  console.log(`download of ${blobName} success`);
}

export async function deleteBlob(blobName) {
  if (!blobName) {
    throw new Error('Blob name is undefined');
  }
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  await blobClient.delete();
  console.log(`Deletion of ${blobName} successful`);
}
