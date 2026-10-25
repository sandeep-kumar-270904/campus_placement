const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireFeature } = require('../middleware/featureFlagMiddleware');
const resourceController = require('../controllers/resourceController');

router.use(protect);
router.use(requireFeature('consolidatedResources'));

router.get('/', resourceController.getResources);
router.get('/bookmarks', resourceController.getBookmarks);
router.post('/bookmarks/:resourceId', resourceController.toggleBookmark);

module.exports = router;
