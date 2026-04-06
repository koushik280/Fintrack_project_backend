const User = require("../../models/User");
const Transaction = require("../../models/TranSaction");
const AdminLog = require("../../models/AdminLog");
const FlaggedTransaction = require("../../models/FlaggedTransaction");

// ---------- Dashboard ----------
class AdminController {
  // @desc    Get admin dashboard statistics
  // @route   GET /api/admin/dashboard

  async getDashboardStats(req, res) {
    try {
      const totalUsers = await User.countDocuments({ role: "user" });
      const totalTransactions = await Transaction.countDocuments();
      //over all icome vs expense
      const totals = await Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
            },
            totalExpense: {
              $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
            },
          },
        },
      ]);
      const { totalIncome = 0, totalExpense = 0 } = totals[0] || {};

      // Cash vs card usage (count of transactions, not amount)
      const modeCount = await Transaction.aggregate([
        {
          $group: {
            _id: { $cond: [{ $ifNull: ["$card", false] }, "card", "cash"] },
            count: { $sum: 1 },
          },
        },
      ]);
      const cashCount = modeCount.find((m) => m._id === "cash")?.count || 0;
      const cardCount = modeCount.find((m) => m._id === "card")?.count || 0;
      // Recent transactions (last 5)
      const recentTransactions = await Transaction.find({})
        .populate("user", "name email")
        .sort({ date: -1 })
        .limit(5);

      res.json({
        totalUsers,
        totalTransactions,
        totalIncome,
        totalExpense,
        cashCount,
        cardCount,
        recentTransactions,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // ---------- User Management ----------
  // @desc    Get users with pagination and search
  // @route   GET /api/admin/users
  async getUser(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
      let query = { role: "user" };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const users = await User.find(query)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      const total = await User.countDocuments(query);
      res.json({
        users,
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Get single user details (including aggregated income/expense)
  // @route   GET /api/admin/users/:id

  async getUserDetails(req, res) {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      //Aggregate total for this user
      const totals = await Transaction.aggregate([
        {
          $match: { user: user._id },
        },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
            },
            totalExpense: {
              $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
            },
          },
        },
      ]);
      const { totalIncome = 0, totalExpense = 0 } = totals[0] || {};
      // Optionally fetch recent transactions (limit 10)
      const recentTransactions = await Transaction.find({ user: user._id })
        .sort({ date: -1 })
        .limit(10);

      res.json({ user, totalIncome, totalExpense, recentTransactions });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Block or unblock a user
  // @route   PATCH /api/admin/users/:id/block
  async toggleBlockUser(req, res) {
    try {
      const userId = req.params.id;
      const { block } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      // Prevent blocking yourself
      if (user._id === req.user.id)
        return res.status(400).json({ message: "You cannot block yourself" });
      user.isBlocked = block;
      await user.save();
      //log the action
      await AdminLog.create({
        adminId: req.user.id,
        action: block ? "block_user" : "unblock_user",
        targetId: userId,
        targetModel: "User",
        details: {
          reason: req.body.reason || "",
        },
      });
      res.json({ message: block ? "User blocked" : "User unblocked", user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // ---------- Transaction Monitoring ----------
  // @desc    Get all transactions with filters (read‑only)
  // @route   GET /api/admin/transactions

  async getAllTransactions(req, res) {
    try {
      const {
        type,
        mode,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = req.query;
      const filter = {};
      if (type) filter.type = type;
      if (mode) {
        if (mode === "cash") filter.card = null;
        else if (mode === "card") filter.card = { $ne: null };
      }
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const transactions = await Transaction.find(filter)
        .populate("user", "name email")
        .populate("card", "nickname lastFour")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      const total = await Transaction.countDocuments(filter);
      res.json({
        transactions,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Flag a transaction as suspicious
  // @route   PATCH /api/admin/transactions/:id/flag
  async flagTransaction(req, res) {
    try {
      const transactionId = req.params.id;
      const { reason } = req.body;

      const transaction = await Transaction.findById(transactionId);
      if (!transaction)
        return res.status(404).json({ message: "Transaction not found" });

      // Check if already flagged
      const existing = await FlaggedTransaction.findOne({
        transaction: transactionId,
      });
      if (existing) {
        return res.status(400).json({ message: "Transaction already flagged" });
      }

      const flagged = await FlaggedTransaction.create({
        transaction: transactionId,
        reason,
      });

      // Log admin action
      await AdminLog.create({
        adminId: req.user.id,
        action: "flag_transaction",
        targetId: transactionId,
        targetModel: "Transaction",
        details: { reason },
      });

      res.json({ message: "Transaction flagged", flagged });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  // @desc    Get monthly income/expense trends (all users)
  // @route   GET /api/admin/analytics/monthly
  async getMonthlyTrend(req, res) {
    try {
      // Aggregation: group by year-month and sum income/expense
      const monthlyData = await Transaction.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            income: {
              $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
            },
            expenses: {
              $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Format as { month: "YYYY-MM", income, expenses }
      const formatted = monthlyData.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        income: item.income,
        expenses: item.expenses,
      }));

      res.json(formatted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  // @desc    Get total spending by category across all users
  // @route   GET /api/admin/analytics/categories
  async getCategorySpending(req, res) {
    try {
      const categoryData = await Transaction.aggregate([
        { $match: { type: "expense" } },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
          },
        },
        { $sort: { total: -1 } },
      ]);

      const formatted = categoryData.map((item) => ({
        name: item._id,
        value: item.total,
      }));

      res.json(formatted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Get audit logs
  // @route   GET /api/admin/audit-logs
  async getAuditLogs(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const logs = await AdminLog.find({})
        .populate("adminId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await AdminLog.countDocuments();

      res.json({
        logs,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new AdminController();
