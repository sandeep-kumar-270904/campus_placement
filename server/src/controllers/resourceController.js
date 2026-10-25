const { ALL_RESOURCES } = require('../data/resourcesData');
const StudentProfile = require('../models/StudentProfile');

/**
 * @desc    Get consolidated career & learning platforms catalog with tabs and role recommendation
 * @route   GET /api/resources
 * @access  Private (Behind consolidatedResources flag)
 */
exports.getResources = async (req, res) => {
  try {
    const { q, tab = 'all', category, targetRole } = req.query;
    const userId = req.user?.id || req.user?._id;

    // Fetch student profile to get saved bookmarks & default targetRole
    let studentBookmarks = [];
    let resolvedTargetRole = targetRole || 'Software Development Engineer';

    if (userId) {
      const profile = await StudentProfile.findOne({ user: userId }).lean();
      if (profile) {
        studentBookmarks = profile.bookmarkedResources || [];
        if (!targetRole && profile.targetRole) {
          resolvedTargetRole = profile.targetRole;
        }
      }
    }

    let filtered = [...ALL_RESOURCES];

    // Search query matching
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    // Tab filter
    if (tab === 'learning') {
      filtered = filtered.filter((p) => p.resourceType === 'learning');
    } else if (tab === 'jobs') {
      filtered = filtered.filter((p) => p.resourceType === 'job');
    } else if (tab === 'dsa') {
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase().includes('coding') ||
          p.category.toLowerCase().includes('dsa') ||
          p.tags?.some((t) => ['dsa', 'algorithms', 'leetcode'].includes(t.toLowerCase()))
      );
    } else if (tab === 'courses') {
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase().includes('course') ||
          p.category.toLowerCase().includes('web') ||
          p.tags?.some((t) => ['full stack', 'react', 'node.js'].includes(t.toLowerCase()))
      );
    } else if (tab === 'startups') {
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase().includes('startup') ||
          p.category.toLowerCase().includes('remote') ||
          p.tags?.some((t) => ['startup', 'remote', 'yc'].includes(t.toLowerCase()))
      );
    } else if (tab === 'internships') {
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase().includes('internship') ||
          p.tags?.some((t) => ['internship', 'early career'].includes(t.toLowerCase()))
      );
    } else if (tab === 'bookmarks') {
      filtered = filtered.filter((p) => studentBookmarks.includes(p.id));
    }

    // Curated recommendations based on target role
    const normalizedRole = resolvedTargetRole.toLowerCase();
    const recommended = ALL_RESOURCES.filter((p) => {
      if (p.targetRoles && p.targetRoles.some((r) => r.toLowerCase().includes(normalizedRole))) {
        return true;
      }
      // General fallbacks for software roles
      return ['leetcode', 'neetcode', 'geeksforgeeks', 'wellfound', 'linkedin', 'unstop', 'github'].includes(p.id);
    }).slice(0, 8);

    res.json({
      success: true,
      total: filtered.length,
      tab,
      targetRole: resolvedTargetRole,
      recommended,
      bookmarks: studentBookmarks,
      resources: filtered,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch resources.' } });
  }
};

/**
 * @desc    Get user's bookmarked resource IDs
 * @route   GET /api/resources/bookmarks
 * @access  Private
 */
exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const profile = await StudentProfile.findOne({ user: userId }).lean();
    const bookmarks = profile?.bookmarkedResources || ['leetcode', 'neetcode', 'linkedin', 'wellfound'];

    res.json({
      success: true,
      bookmarks,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch bookmarks.' } });
  }
};

/**
 * @desc    Toggle a resource bookmark (add or remove)
 * @route   POST /api/resources/bookmarks/:resourceId
 * @access  Private
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { resourceId } = req.params;

    if (!resourceId) {
      return res.status(400).json({ error: { message: 'Resource ID is required.' } });
    }

    const profile = await StudentProfile.findOne({ user: userId });
    if (!profile) {
      return res.json({
        success: true,
        resourceId,
        isBookmarked: true,
        bookmarks: [resourceId],
      });
    }

    const existing = profile.bookmarkedResources || [];
    const index = existing.indexOf(resourceId);
    let isBookmarked = false;

    if (index > -1) {
      existing.splice(index, 1);
      isBookmarked = false;
    } else {
      existing.push(resourceId);
      isBookmarked = true;
    }

    profile.bookmarkedResources = existing;
    await profile.save();

    res.json({
      success: true,
      resourceId,
      isBookmarked,
      bookmarks: profile.bookmarkedResources,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to toggle bookmark.' } });
  }
};
