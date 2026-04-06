const TranSaction = require("../models/TranSaction");
const Card = require("../models/Card");
const { getIO } = require("../socket");
const Budget = require("../models/Budget");
const User = require("../models/User");
const Notification = require("../models/Notification");

async function saveNotificationForAdmins(transaction, userInfo) {
  const admins = await User.find({ role: "admin" }).select("_id");
  const notifications = admins.map((admin) => ({
    userId: admin._id,
    type: "transaction",
    title: "New Transaction",
    message: `New transaction: ${userInfo.name} - ${transaction.description} ($${transaction.amount})`,
    data: { transaction, user: userInfo },
    read: false,
  }));
  if (notifications.length) await Notification.insertMany(notifications);
}

//helper funcation
async function checkBudgetAlert(userId, category, amount, date) {
  const month = date.toISOString().slice(0, 7);
  const budget = await Budget.findOne({ user: userId, category, month });
  if (!budget) return;

  const result = await TranSaction.aggregate([
    {
      $match: {
        user: userId,
        category,
        type: "expense",
        date: { $regex: `^${month}` },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalSpent = (result[0]?.total || 0) + amount;
  const threshold = budget.amount * 0.8;

  if (totalSpent >= threshold && totalSpent - amount < threshold) {
    const io = getIO();
    const message = `You have spent ${((totalSpent / budget.amount) * 100).toFixed(0)}% of your ${category} budget`;
    io.to(`user:${userId}`).emit("budgetAlert", {
      category,
      budgetAmount: budget.amount,
      spent: totalSpent,
      remaining: budget.amount - totalSpent,
      message,
    });
    await Notification.create({
      userId,
      type: "budget",
      title: "Budget Alert",
      message,
      data: {
        category,
        budgetAmount: budget.amount,
        spent: totalSpent,
        remaining: budget.amount - totalSpent,
      },
      read: false,
    });
  }
}

class TranSactionController {
  // @desc    Get all transactions for logged-in user (with optional filters)
  // @route   GET /api/transactions
  async getTransactions(req, res) {
    try {
      const {
        startDate,
        endDate,
        category,
        type,
        cardId,
        page = 1,
        limit = 10,
        sortBy = "date",
        sortOrder = "desc",
        search = "",
      } = req.query;
      let filter = {
        user: req.user.id,
      };
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }
      if (category) filter.category = category;
      if (type) filter.type = type;
      if (cardId) filter.card = cardId;

      //Search filter, case insenseitive regex on description

      if (search) {
        filter.description = { $regex: search, $options: "i" };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

      const transactions = await TranSaction.find(filter)
        .populate("card", "nickname lastFour")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await TranSaction.countDocuments(filter);

      const pagination = {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      };

      res.json({
        transactions,
        total,
        page: pagination.page,
        pages: pagination.pages,
        pagination,
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  }
  // @desc    Create a transaction
  // @route   POST /api/transactions

  async createTransaction(req, res) {
    try {
      const { amount, date, description, category, type, card } = req.body;
      const transaction = await TranSaction.create({
        user: req.user.id,
        amount,
        date: date || Date.now(),
        description,
        category,
        type,
        card: card || null,
      });

      if (transaction.type === "expense") {
        await checkBudgetAlert(
          req.user.id,
          transaction.category,
          transaction.amount,
          transaction.date,
        );
      }

      //Emit to all admins
      const io = getIO();
      const adminRoom = io.sockets.adapter.rooms.get("admin-room");
      console.log(
        `Admin room size at emission: ${adminRoom ? adminRoom.size : 0}`,
      );
      io.to("admin-room").emit("newTransaction", {
        transaction: transaction,
        user: { name: req.user.name, email: req.user.email },
        timstamp: new Date(),
      });

      await saveNotificationForAdmins(transaction, {
        name: req.user.name,
        email: req.user.email,
      });

      console.log(`Emitting newTransaction to admin-room`, transaction._id);

      // If transaction is linked to a card, update card balance

      if (card) {
        const cardDoc = await Card.findById(card);
        if (cardDoc) {
          if (type === "income") {
            cardDoc.balance += amount;
          } else {
            cardDoc.balance -= amount;
          }
          await cardDoc.save();
        }
      }

      res.status(201).json(transaction);
    } catch (error) {
      console.log("CreateTransactionError", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Update a transaction
  // @route   PUT /api/transactions/:id

  async updateTransaction(req, res) {
    try {
      const transaction = await TranSaction.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      if (transaction.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }
      // Handle card balance adjustment if card or amount changes
      // (Simplified: we'll just update the transaction; balance updates can be done via separate logic)
      const updatedTransaction = await TranSaction.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );

      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Delete a transaction
  // @route   DELETE /api/transactions/:id

  async deleteTransaction(req, res) {
    try {
      const transaction = await TranSaction.findById(req.params.id);

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      // Reverse card balance if needed
      if (transaction.card) {
        const cardDoc = await Card.findById(transaction.card);
        if (cardDoc) {
          if (transaction.type === "income") {
            cardDoc.balance -= transaction.amount;
          } else {
            cardDoc.balance += transaction.amount;
          }
          await cardDoc.save();
        }
      }

      await transaction.deleteOne();
      res.json({ message: "Transaction removed" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Import transactions from CSV
  // @route   POST /api/transactions/import

  async importTransactions(req, res) {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl) {
        return res.status(400).json({ message: "No file URL provided" });
      }

      // Download the CSV file from Cloudinary
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      const csvString = response.data.toString("utf8");
      const lines = csvString.split("\n");
      const headers = lines[0].split(",");
      const transactions = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");
        if (row.length < 5) continue;
        const tx = {
          date: new Date(row[0].trim()),
          description: row[1].trim(),
          category: row[2].trim(),
          type: row[3].trim(),
          amount: parseFloat(row[4]),
          cardId: row[5]?.trim() || null,
          user: req.user.id,
        };
        if (isNaN(tx.amount)) continue;
        if (!["income", "expense"].includes(tx.type)) continue;
        transactions.push(tx);
      }

      if (transactions.length === 0) {
        return res
          .status(400)
          .json({ message: "No valid transactions found in CSV" });
      }

      await TranSaction.insertMany(transactions);
      res.json({ message: `Imported ${transactions.length} transactions` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new TranSactionController();
