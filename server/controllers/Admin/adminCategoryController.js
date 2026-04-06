const Category = require("../../models/Category");
const Transaction = require("../../models/TranSaction");

class AdminCategoryController {
  // @desc    Create a system category
  // @route   POST /api/admin/categories
  async createSystemCategory(req, res) {
    try {
      const { name } = req.body;
      const existing = await Category.findOne({ name, type: "system" });
      if (existing)
        return res.status(400).json({ message: "Category already exists" });

      const category = await Category.create({
        name,
        type: "system",
        isActive: true,
      });
      res.status(201).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Get all system categories
  // @route   GET /api/admin/categories
  async getSystemCategories(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "name",
        sortOrder = "asc",
        isActive,
      } = req.query;

      let filter = { type: "system" };
      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      if (isActive != undefined) {
        filter.isActive = isActive === "true";
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

      const categories = await Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Category.countDocuments(filter);

      res.json({
        categories,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Update a system category (name, active status)
  // @route   PATCH /api/admin/categories/:id
  async updateSystemCategory(req, res) {
    try {
      const { name, isActive } = req.body;
      const category = await Category.findById(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });

      if (category.type !== "system")
        return res
          .status(400)
          .json({ message: "Category is not a system category" });
      if (name) category.name = name;
      if (isActive !== undefined) category.isActive = isActive;
      await category.save();
      res.json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Delete a system category (soft delete)
  // @route   DELETE /api/admin/categories/:id
  async deleteSystemCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      if (category.type !== "system") {
        return res
          .status(400)
          .json({ message: "Cannot delete user categories" });
      }
      category.isActive = false;
      await category.save();
      res.json({ message: "Category deactivated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Get all user-created categories (for moderation)
  // @route   GET /api/admin/categories/user
  async getUserCategories(req, res) {
    try {
      const categories = await Category.find({ type: "user" })
        .populate("user", "name email")
        .sort({ createdAt: -1 });
      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Flag a user category as inappropriate
  // @route   PATCH /api/admin/categories/:id/flag
  async flagCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      if (category.type !== "user") {
        return res
          .status(400)
          .json({ message: "Only user categories can be flagged" });
      }
      category.isFlagged = !category.isFlagged; // toggle
      await category.save();
      res.json({
        message: `Category ${category.isFlagged ? "flagged" : "unflagged"}`,
        category,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Get category analytics (most used, transaction count, spending)
  // @route   GET /api/admin/categories/analytics
  async getCategoryAnalytics(req, res) {
    try {
      // Most used categories (by transaction count)
      const mostUsed = await Transaction.aggregate([
        { $match: { type: "expense" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);
      // Spending distribution per category
      const spending = await Transaction.aggregate([
        { $match: { type: "expense" } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]);
      res.json({ mostUsed, spending });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new AdminCategoryController();
