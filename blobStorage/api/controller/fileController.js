require("dotenv").config();
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");


const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const storageAccKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const sharedKeyCredential = new StorageSharedKeyCredential(account, storageAccKey);
const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    sharedKeyCredential
);

const uploadFile = async (req, res) => {
    try {
        const uploadedFiles = [];

        for (const file of req.files) {
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobName = `${uuidv4()}-${file.originalname}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.uploadData(file.buffer, {
                blobHTTPHeaders: { blobContentType: file.mimetype },
            });

            uploadedFiles.push({
                fileName: file.originalname,
                fileUrl: `https://${account}.blob.core.windows.net/${containerName}/${blobName}`,
            });
        }

        res.status(200).json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Error uploading file", error });
    }
};



const listBlobs = async (req, res) => {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            blobs.push(blob);
        }
        if (blobs.length > 0) {
            res.status(200).json({
                message: "Blobs listed successfully",
                blobs,
            });
        } else {
            res.status(404).json({
                message: "No blobs found",
            });
        }
    } catch (error) {
        console.error("Error listing blobs:", error);
        res.status(500).json({ message: "Error listing blobs", error });
    }
}

const deleteBlob = async (req, res) => {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobName = req.params.blobName;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Check if the blob exists
        const exists = await blockBlobClient.exists();
        if (!exists) {
            return res.status(404).json({
                message: "Blob not found",
            });
        }
        // Delete the blob
        await blockBlobClient.delete();

        res.status(200).json({
            message: "Blob deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting blob:", error);
        res.status(500).json({ message: "Error deleting blob", error });
    }
}
module.exports = {
    uploadFile,
    listBlobs,
    deleteBlob
}
