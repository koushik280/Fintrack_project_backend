const express = require("express");
const router = express.Router();
const adminCategoryController = require("../../controllers/Admin/adminCategoryController");
const { protect } = require("../../middleware/authMiddleware");
const { roleMiddleware } = require("../../middleware/roleMiddleware");

router.use(protect);
router.use(roleMiddleware(["admin"]));

router.post("/categories", adminCategoryController.createSystemCategory);
router.get("/categories", adminCategoryController.getSystemCategories);
router.patch("/categories/:id", adminCategoryController.updateSystemCategory);
router.delete("/categories/:id", adminCategoryController.deleteSystemCategory);
router.get("/categories/user", adminCategoryController.getUserCategories);
router.patch("/categories/:id/flag", adminCategoryController.flagCategory);
router.get("/categories/analytics", adminCategoryController.getCategoryAnalytics);

module.exports = router;


