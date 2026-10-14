const path = require('path');
const StudentProfile = require('../models/StudentProfile');

// @desc    Upload document / resume
// @route   POST /api/documents/upload
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided. Please upload a PDF or document.' });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    // If student is logged in, optionally link to their profile
    if (req.user && req.user.userId) {
      const profile = await StudentProfile.findOne({ userId: req.user.userId });
      if (profile) {
        profile.resumeUrl = fileUrl;
        await profile.save();
      }
    }

    res.status(200).json({
      message: 'Document uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: fileUrl
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during file upload', error: err.message });
  }
};
