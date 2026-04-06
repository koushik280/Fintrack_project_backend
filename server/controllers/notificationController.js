const Notification = require("../models/Notification");

class NotificationController {
  // @desc    Get unread notifications for logged‑in user (admin)
  // @route   GET /api/notifications/unread
  async getUnreadNotifications(req, res) {
    try {
      const notifications = await Notification.find({
        userId: req.user.id,
        read: false,
      }).sort({ createdAt: -1 });
      console.log(`Found ${notifications.length} unread notifications`);
      res.json(notifications);
    } catch (error) {
      console.error("Get all notifications", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Mark a notification as read
  // @route   PATCH /api/notifications/:id/read

  async markAsRead(req, res) {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) return res.status(404).json({ message: "Not found" });
      if (notification.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      notification.read = true;
      await notification.save();
      res.json({ message: "Marked as read" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Mark all notifications as read
  // @route   PATCH /api/notifications/read-all

  async markAllAsRead(req, res) {
    try {
      console.log(`Marking all as read for user ${req.user.id}`);

      const result = await Notification.updateMany(
        { userId: req.user.id, read: false },
        { $set: { read: true } },
      );
      console.log(`Updated ${result.modifiedCount} notifications`);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new NotificationController();
