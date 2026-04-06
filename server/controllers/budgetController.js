const Budget = require("../models/Budget");

class BudgetController {
  // @desc    Get all budgets for logged-in user
  // @route   GET /api/budgets
  async getBudgets(req, res) {
    try {
      const budgets = await Budget.find({ user: req.user.id }).sort({
        month: -1,
      });
      res.status(200).json(budgets);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error" });
    }
  }

  // @desc    Create a budget
  // @route   POST /api/budgets
  async createBudget(req, res) {
    try {
      const { category, month, amount } = req.body;
      // Check if budget already exists for this user, category, month
      const existing = await Budget.findOne({
        user: req.user.id,
        category,
        month,
      });
      if (existing) {
        return res.status(400).json({
          message: "Budget already exists for this category and month",
        });
      }
      const budget = await Budget.create({
        user: req.user.id,
        category,
        month,
        amount,
      });

      res.status(201).json(budget);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Update a budget
  // @route   PUT /api/budgets/:id
  async updateBudget(req, res) {
    try {
      const budget = await Budget.findById(req.params.id);

      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }

      if (budget.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const updatedBudget = await Budget.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );

      res.json(updatedBudget);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Delete a budget
  // @route   DELETE /api/budgets/:id
  async deleteBudget(req, res) {
    try {
      const budget = await Budget.findById(req.params.id);

      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }

      if (budget.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      await budget.deleteOne();
      res.json({ message: "Budget removed" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new BudgetController();
