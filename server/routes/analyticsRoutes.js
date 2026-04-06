const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const analyticsController = require("../controllers/analyticsController");
const router = express.Router();
router.get("/monthly", protect, analyticsController.getMonthlyAnalytics);
router.get("/categories", protect, analyticsController.getCategoryAnalytics);
router.get("/summary", protect, analyticsController.getSummary);
router.get('/net-worth', protect, analyticsController.getNetWorth);
module.exports = router;


