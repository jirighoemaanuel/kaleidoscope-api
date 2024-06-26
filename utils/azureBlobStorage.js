import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.CONNECTIONSTRING;
const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
// const containerName = 'my-container';

// Create a container for a user after they register
export async function createUserContainer(userId) {
  const containerName = userId;
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Create the container if it doesn't exist
  const createContainerResponse = await containerClient.createIfNotExists();
  if (createContainerResponse.succeeded) {
    console.log(`Created container ${containerName} successfully`);
  } else {
    console.log(`Container ${containerName} already exists`);
  }
}

`After you have sucessfully created a container for a user, Find a way to make each route call to these functions below call to the container of a specific user. Save the container assigned to the the user to the mongodb and call on it before making any request to these functions below`;

`Also you changed the functions below to use an argument for the container name. When calling these functions in the files controller, find a way to pass in the contianer specific to a user jwt. Don't forget also to implement the instructions above. We need to keep track of the container specific to a user`;

// upload to user container
export async function uploadToBlob(content, blobName, containerName) {
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

// Download from container
export async function downloadBlobToFile(
  blobName,
  fileNameWithPath,
  containerName
) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  await blobClient.downloadToFile(fileNameWithPath);
  console.log(`download of ${blobName} success`);
}

// deleter from
export async function deleteBlob(blobName, containerName) {
  if (!blobName) {
    throw new Error('Blob name is undefined');
  }
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  await blobClient.delete();
  console.log(`Deletion of ${blobName} successful`);
}
