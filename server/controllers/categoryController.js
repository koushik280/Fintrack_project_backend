const Category = require("../models/Category");

// @desc    Get categories for the logged-in user (both their own + active system categories)
// @route   GET /api/categories

class CategoryController {
  async getUserCategories(req, res) {
    try {
      const userId = req.user.id;
      const systemCategories = await Category.find({
        type: "system",
        isActive: true,
      }).select("name type");
      const userCategories = await Category.find({
        user: userId,
        type: "user",
        isActive: true,
      }).select("name type");
      const all = [...systemCategories, ...userCategories].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      res.json(all);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Create a new user category
  // @route   POST /api/categories

  async createUserCategory(req, res) {
    try {
      const { name } = req.body;
      const userId = req.user.id;
      // Check if user already has a category with this name
      const existing = await Category.findOne({ user: userId, name });
      if (existing)
        return res
          .status(400)
          .json({ message: "You already have a category with this name" });

      // Check if a system category with the same name exists (allow? We'll allow, but we'll just create user category)
      const category = await Category.create({
        name,
        type: "user",
        user: userId,
        isActive: true,
      });
      res.status(201).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  //@desc    Update a user category (only name)
  // @route   PATCH /api/categories/:id

  async updateUserCategory(req, res) {
    try {
      const { name } = req.body;
      const category = await Category.findById(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      if (
        category.type !== "user" ||
        category.user.toString() !== req.user.id
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to modify this category" });
      }
      // Check name uniqueness for this user
      const existing = await Category.findOne({
        user: req.user.id,
        name,
        _id: { $ne: category._id },
      });
      if (existing)
        return res
          .status(400)
          .json({ message: "You already have a category with that name" });
      category.name = name;
      await category.save();
      res.json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Delete a user category (soft delete)
  // @route   DELETE /api/categories/:id
  async deleteUserCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      if (
        category.type !== "user" ||
        category.user.toString() !== req.user.id
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this category" });
      }
      category.isActive = false;
      await category.save();
      res.json({ message: "Category deactivated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new CategoryController();
