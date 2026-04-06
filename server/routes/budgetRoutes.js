const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const budgetController = require("../controllers/budgetController");

const router = express.Router();

router
  .route("/")
  .get(protect, budgetController.getBudgets)
  .post(protect, budgetController.createBudget);

router
  .route("/:id")
  .put(protect, budgetController.updateBudget)
  .delete(protect, budgetController.deleteBudget);

module.exports = router;
