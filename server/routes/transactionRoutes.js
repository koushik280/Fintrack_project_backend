const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const transactionController = require("../controllers/transactionController");

const router = express.Router();

router.get("/", protect, transactionController.getTransactions);
router.post("/", protect, transactionController.createTransaction);
router.put("/:id", protect, transactionController.updateTransaction);
router.delete("/:id", protect, transactionController.deleteTransaction);
router.post("/import", protect, transactionController.importTransactions);
module.exports = router;
