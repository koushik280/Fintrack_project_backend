const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const CategoryController = require("../controllers/categoryController");

const router = express.Router();

router.use(protect);
router.get("/", CategoryController.getUserCategories);
router.post("/", CategoryController.createUserCategory);
router.patch("/:id", CategoryController.updateUserCategory);
router.delete("/:id", CategoryController.deleteUserCategory);

module.exports = router;
