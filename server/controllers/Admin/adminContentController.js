const Content = require("../../models/Content");

class AdminContentController {
  // @desc    Get all content (admin)
  // @route   GET /api/admin/content
  async getAllContent(req, res) {
    try {
      const content = await Content.find({}).sort({ type: 1, order: 1 });
      res.json(content);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Create a content item
  // @route   POST /api/admin/content

  async createContent(req, res) {
    try {
      const { type, data, order } = req.body;
      const content = await Content.create({ type, data, order });
      res.status(201).json(content);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Update a content item
  // @route   PATCH /api/admin/content/:id

  async updateContent(req, res) {
    try {
      const { data, order, isActive } = req.body;
      const content = await Content.findById(req.params.id);
      if (!content)
        return res.status(404).json({ message: "Content not found" });
      if (data) content.data = data;
      if (order !== undefined) content.order = order;
      if (isActive !== undefined) content.isActive = isActive;
      await content.save();
      res.json(content);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Delete a content item
  // @route   DELETE /api/admin/content/:id
  async deleteContent(req, res) {
    try {
      const content = await Content.findByIdAndDelete(req.params.id);
      if (!content)
        return res.status(404).json({ message: "Content not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new AdminContentController();



