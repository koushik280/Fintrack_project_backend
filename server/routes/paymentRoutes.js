const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const PaymentController = require("../controllers/paymentController");
const router = express.Router();

router.post(
  "/create-session",
  protect,
  PaymentController.createCheckoutSession,
);
router.post("/verify", protect, PaymentController.verifyPayment);
router.post("/webhook", PaymentController.webhook);

module.exports = router;
