const mongoose = require('mongoose');
const Company = require('../models/Company');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get paginated companies CRM list with filters
 * @route   GET /api/tpo/companies
 * @access  Private (TPO / SuperAdmin)
 */
exports.getCompanies = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      tier = '',
      industry = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      ...(collegeId ? { collegeId } : {}),
    };

    if (search) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    if (status) {
      query.status = status;
    }
    if (tier) {
      query.tier = tier;
    }
    if (industry) {
      query.industry = { $regex: industry.trim(), $options: 'i' };
    }

    const [companies, total] = await Promise.all([
      Company.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Company.countDocuments(query),
    ]);

    // KPI stats across companies for this college
    const statsAgg = await Company.aggregate([
      { $match: collegeId ? { collegeId: new mongoose.Types.ObjectId(collegeId) } : {} },
      {
        $group: {
          _id: null,
          totalCompanies: { $sum: 1 },
          confirmedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
          },
          visitedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'visited'] }, 1, 0] },
          },
          superDreamCount: {
            $sum: { $cond: [{ $eq: ['$tier', 'Super Dream'] }, 1, 0] },
          },
          dreamCount: {
            $sum: { $cond: [{ $eq: ['$tier', 'Dream'] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = statsAgg[0] || {
      totalCompanies: 0,
      confirmedCount: 0,
      visitedCount: 0,
      superDreamCount: 0,
      dreamCount: 0,
    };

    res.json({
      success: true,
      companies,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch companies.' } });
  }
};

/**
 * @desc    Create a new company in CRM
 * @route   POST /api/tpo/companies
 * @access  Private (TPO / SuperAdmin)
 */
exports.createCompany = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      name,
      logo = '',
      industry = 'Software & Technology',
      tier = 'Dream',
      status = 'prospect',
      website = '',
      contactPersons = [],
      pastVisits = [],
      ctcHistory = [],
      notes = '',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: { message: 'Company name is required.' } });
    }

    // Check duplicate
    const existing = await Company.findOne({
      ...(collegeId ? { collegeId } : {}),
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    });
    if (existing) {
      return res.status(400).json({ error: { message: 'A company with this name already exists in CRM.' } });
    }

    const initialNotes = notes && notes.trim() ? [{
      note: notes.trim(),
      createdBy: req.user?.id || req.user?._id,
      createdAt: new Date(),
    }] : [];

    const company = await Company.create({
      collegeId,
      name: name.trim(),
      logo,
      industry,
      tier,
      status,
      website,
      contactPersons,
      pastVisits,
      ctcHistory,
      notes: initialNotes,
    });

    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'COMPANY_CREATED',
      targetModel: 'Company',
      targetId: company._id,
      details: { name: company.name, tier: company.tier, status: company.status },
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully.',
      company,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to create company.' } });
  }
};

/**
 * @desc    Update existing company details
 * @route   PUT /api/tpo/companies/:id
 * @access  Private (TPO / SuperAdmin)
 */
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      name,
      logo,
      industry,
      tier,
      status,
      website,
      contactPersons,
      pastVisits,
      ctcHistory,
      newNote,
    } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ error: { message: 'Company not found.' } });
    }

    if (name) company.name = name.trim();
    if (logo !== undefined) company.logo = logo;
    if (industry) company.industry = industry;
    if (tier) company.tier = tier;
    if (status) company.status = status;
    if (website !== undefined) company.website = website;
    if (contactPersons) company.contactPersons = contactPersons;
    if (pastVisits) company.pastVisits = pastVisits;
    if (ctcHistory) company.ctcHistory = ctcHistory;

    if (newNote && newNote.trim()) {
      company.notes.unshift({
        note: newNote.trim(),
        createdBy: req.user?.id || req.user?._id,
        createdAt: new Date(),
      });
    }

    await company.save();

    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'COMPANY_UPDATED',
      targetModel: 'Company',
      targetId: company._id,
      details: { name: company.name, status: company.status, tier: company.tier },
    });

    res.json({
      success: true,
      message: 'Company updated successfully.',
      company,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update company.' } });
  }
};

/**
 * @desc    Add a follow-up reminder for a company
 * @route   POST /api/tpo/companies/:id/reminder
 * @access  Private (TPO / SuperAdmin)
 */
exports.setCompanyReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { title, dueDate } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ error: { message: 'Reminder title and dueDate are required.' } });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ error: { message: 'Company not found.' } });
    }

    company.followUpReminders.push({
      title: title.trim(),
      dueDate: new Date(dueDate),
      completed: false,
      createdBy: req.user?.id || req.user?._id,
      createdAt: new Date(),
    });

    await company.save();

    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'COMPANY_REMINDER_ADDED',
      targetModel: 'Company',
      targetId: company._id,
      details: { title, dueDate },
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up reminder set successfully.',
      reminders: company.followUpReminders,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to set reminder.' } });
  }
};
