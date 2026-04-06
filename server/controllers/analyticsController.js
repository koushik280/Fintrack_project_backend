const Transaction = require("../models/TranSaction");

class AnalyticsController {
  /**
   * Get monthly income and expenses for the last 6 months (or custom range)
   * @route GET /api/analytics/monthly
   * @access Private
   */
  // async getMonthlyAnalytics(req, res) {
  //   try {
  //     const { startDate, endDate } = req.query;
  //     const userId = req.user.id;

  //     // Build a date filter if query params are provided
  //     const matchStage = { user: userId };
  //     if (startDate || endDate) {
  //       matchStage.date = {};
  //       if (startDate) matchStage.date.$gte = new Date(startDate);
  //       if (endDate) matchStage.date.$lte = new Date(endDate);
  //     }

  //     console.log('matchStage:', matchStage);

  //     // MongoDB aggregation pipeline
  //     const monthlyData = await Transaction.aggregate([
  //       { $match: matchStage },
  //       {
  //         $group: {
  //           _id: {
  //             year: { $year: "$date" },
  //             month: { $month: "$date" },
  //           },
  //           income: {
  //             $sum: {
  //               $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
  //             },
  //           },
  //           expenses: {
  //             $sum: {
  //               $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
  //             },
  //           },
  //         },
  //       },
  //       { $sort: { "_id.year": 1, "_id.month": 1 } },
  //     ]);

  //     // Transform to a format suitable for Recharts
  //     const formatted = monthlyData.map((item) => ({
  //       month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
  //       income: item.income,
  //       expenses: item.expenses,
  //     }));

  //     // If no date range, return only last 6 months (by slicing)
  //     if (!startDate && !endDate) {
  //       // Sort descending to get most recent first, then take last 6, then re-sort ascending
  //       const recent = formatted.reverse().slice(0, 6).reverse();
  //       return res.json(recent);
  //     }

  //     res.json(formatted);
  //   } catch (error) {
  //     console.error("Monthly analytics error:", error);
  //     res.status(500).json({ message: "Server error" });
  //   }
  // }
  async getMonthlyAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user.id;

      const matchStage = { user: userId };
      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
      }

      // Debug: log the matchStage
      console.log("matchStage:", matchStage);

      // First, get all transactions that match to ensure they exist
      const allTxs = await Transaction.find(matchStage).lean();
      console.log("All transactions count:", allTxs.length);
      console.log("Sample transaction:", allTxs[0]);

      // If no transactions, return empty
      if (allTxs.length === 0) {
        return res.json([]);
      }

      const monthlyData = await Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            income: {
              $sum: {
                $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
              },
            },
            expenses: {
              $sum: {
                $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
              },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      console.log("Monthly data:", monthlyData);

      const formatted = monthlyData.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        income: item.income,
        expenses: item.expenses,
      }));

      res.json(formatted);
    } catch (error) {
      console.error("Monthly analytics error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
  /**
   * Get spending breakdown by category (expenses only)
   * @route GET /api/analytics/categories
   * @access Private
   */
  async getCategoryAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const userId = req.user.id;
      const matchStage = { user: userId, type: "expense" };

      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = new Date(startDate);
        if (endDate) matchStage.date.$lte = new Date(endDate);
      }

      const categoryData = await Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$category",
            amount: { $sum: "$amount" },
          },
        },
        { $sort: { total: -1 } },
      ]);

      // Format for Recharts PieChart: [{ name: 'Groceries', value: 400 }]
      const formatted = categoryData.map((item) => ({
        name: item._id,
        value: item.total,
      }));

      res.status(200).json(formatted);
    } catch (error) {
      console.error("Category analytics error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  /**
   * Get a quick summary of the current month (income, expenses, balance)
   * @route GET /api/analytics/summary
   * @access Private
   */

  async getSummary(req, res) {
    try {
      const userId = req.user.id;
      const now = new Date();
      const startOfMOnth = new Date(now.getFullYear(), now.getMonth(), 1);

      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const transaction = await Transaction.find({
        user: userId,
        date: { $gte: startOfMOnth, $lte: endOfMonth },
      });

      let income = 0;
      let expenses = 0;
      transaction.forEach((item) => {
        if (item.type === "income") {
          income += item.amount;
        } else {
          expenses += item.amount;
        }
      });
      res.json({ income, expenses, balance: income - expenses });
    } catch (error) {
      console.error("Summary analytics error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Get cumulative net worth over time (monthly)
  // @route   GET /api/analytics/net-worth
  async getNetWorth(req, res) {
    try {
      const userId = req.user.id;
      const transactions = await Transaction.find({ user: userId }).sort({
        date: 1,
      });
      let runningBalance = 0;
      const monthlyWorth = new Map(); // month -> netWorth

      transactions.forEach((tx) => {
        const month = tx.date.toISOString().slice(0, 7); // YYYY-MM
        if (tx.type === "income") runningBalance += tx.amount;
        else runningBalance -= tx.amount;
        monthlyWorth.set(month, runningBalance);
      });

      // Convert to array sorted by month
      const netWorthData = Array.from(monthlyWorth.entries())
        .map(([month, netWorth]) => ({ month, netWorth }))
        .sort((a, b) => a.month.localeCompare(b.month));

      res.json(netWorthData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new AnalyticsController();
