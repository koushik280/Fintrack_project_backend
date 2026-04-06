const Payment = require("../models/Payment");
const User = require("../models/User");
const crypto = require("crypto");

class PaymentController {
  // @desc    Create a mock checkout session
  // @route   POST /api/payments/create-session
  async createCheckoutSession(req, res) {
    try {
      const { plan = "pro" } = req.body;
      const userId = req.user.id;
      const sessionId = crypto.randomBytes(32).toString("hex");
      const payment = await Payment.create({
        user: userId,
        sessionId,
        amount: 9.99,
        plan,
        status: "pending",
      });

      const mockPaymentUrl = `${process.env.CLIENT_URL}/payment/mock?sessionId=${sessionId}`;

      res.json({ sessionId, mockPaymentUrl });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Verify payment after mock payment page
  // @route   POST /api/payments/verify

  async verifyPayment(req, res) {
    try {
      const { sessionId, success } = req.body;
      const payment = await Payment.findOne({ sessionId });
      if (!payment)
        return res.status(404).json({ message: "Payment session not found" });

      if (success) {
        payment.status = "success";
        await payment.save();

        const user = await User.findById(payment.user);
        if (user) {
          user.subscription = {
            plan: payment.plan,
            status: "active",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          };
          user.plan = payment.plan; // legacy
          await user.save();
        }

        res.json({ message: "Payment successful, subscription upgraded" });
      } else {
        payment.status = "failed";
        await payment.save();
        res.status(400).json({ message: "Payment failed" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Simulate webhook (optional)
  // @route   POST /api/payments/webhook

  async webhook(req, res) {
    const { sessionId, status } = req.body;
    try {
      const payment = await Payment.findOne({ sessionId });
      if (!payment)
        return res.status(404).json({ message: "Payment not found" });

      if (status === "success" && payment.status !== "success") {
        payment.status = "success";
        await payment.save();

        const user = await User.findById(payment.user);
        if (user) {
          user.subscription = {
            plan: payment.plan,
            status: "active",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          };
          user.plan = payment.plan;
          await user.save();
        }
      }
      res.json({ received: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new PaymentController();
