const StudentProfile = require('../models/StudentProfile');

// @desc    Get current user profile
// @route   GET /api/profile/me
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.userId }).populate('userId', ['firstName', 'lastName', 'email']);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Create or update profile
// @route   POST /api/profile
exports.upsertProfile = async (req, res) => {
  try {
    const { personalInfo, academicInfo, skills, careerGoals } = req.body;
    
    let profile = await StudentProfile.findOne({ userId: req.user.userId });

    if (profile) {
      // Update
      profile.personalInfo = personalInfo || profile.personalInfo;
      profile.academicInfo = academicInfo || profile.academicInfo;
      profile.skills = skills || profile.skills;
      profile.careerGoals = careerGoals || profile.careerGoals;
      
      // If student updates profile, reset verification status
      if (req.user.role === 'student') {
         profile.isVerified = false;
      }
      
      await profile.save();
      return res.status(200).json(profile);
    }

    // Create
    profile = new StudentProfile({
      userId: req.user.userId,
      personalInfo,
      academicInfo,
      skills,
      careerGoals
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
