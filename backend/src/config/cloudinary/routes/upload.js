// backend/src/modules/uploads/routes/upload.routes.js (or wherever it's located)

const express = require('express');
const upload = require('../../../middlewares/uploadLocal');
const { uploadToCloudinary } = require('../services/cloudinary.service');

const router = express.Router();

// Upload route
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const { url, public_id } = await uploadToCloudinary(filePath, 'images');

    return res.status(200).json({ url, public_id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
