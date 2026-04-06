const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { roleMiddleware } = require("../../middleware/roleMiddleware");
const AdminContentController = require("../../controllers/Admin/adminContentController");

const router = express.Router();

router.use(protect, roleMiddleware(["admin"]));

router.get("/", AdminContentController.getAllContent);
router.post("/", AdminContentController.createContent);
router.patch("/:id", AdminContentController.updateContent);
router.delete("/:id", AdminContentController.deleteContent);

module.exports = router;




