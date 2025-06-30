const express = require('express');
const multer = require('multer');
const { uploadFile, listBlobs, deleteBlob } = require('../controller/fileController');
const router = express.Router();

const upload = multer();

router.post('/upload', upload.array('file'), uploadFile);
router.get('/list', listBlobs);
router.delete('/delete/:blobName', deleteBlob);

module.exports = router;
