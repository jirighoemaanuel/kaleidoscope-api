import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';

import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.CONNECTIONSTRING;

const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

const containerName = 'my-container';

async function main() {
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const content = 'Hello world!';
  const blobName = 'newblob' + new Date().getTime();
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

// main();

async function downloadBlobToFile(blobName, fileNameWithPath) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  // Create blob client from container client
  const blobClient = containerClient.getBlobClient(blobName);

  await blobClient.downloadToFile(fileNameWithPath);
  console.log(`download of ${blobName} success`);
}

(async () => downloadBlobToFile('my-file', './downloads/my-file.txt'))();
