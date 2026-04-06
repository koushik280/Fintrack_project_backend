const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUnreadNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

const router = express.Router();

router.use(protect); 

router.get('/unread',getUnreadNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all',markAllAsRead);

module.exports = router;