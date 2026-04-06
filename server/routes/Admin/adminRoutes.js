const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/Admin/adminController");
const { protect } = require("../../middleware/authMiddleware");
const { roleMiddleware } = require("../../middleware/roleMiddleware");

router.use(protect);
router.use(roleMiddleware(["admin"]));

//dashbord
router.get("/dashboard", adminController.getDashboardStats);

//user Management
router.get("/users", adminController.getUser);
router.get("/users/:id", adminController.getUserDetails);
router.patch("/users/:id/block", adminController.toggleBlockUser);

//transactions
router.get("/transactions", adminController.getAllTransactions);
router.patch("/transactions/:id/flag", adminController.flagTransaction);

router.get("/analytics/monthly", adminController.getMonthlyTrend);
router.get("/analytics/categories", adminController.getCategorySpending);
router.get('/audit-logs', adminController.getAuditLogs);
module.exports = router;
