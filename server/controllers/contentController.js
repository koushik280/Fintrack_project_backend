const Content = require("../models/Content");

// @desc    Get active content by type
// @route   GET /api/content/:type
const getContentByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!["feature", "testimonial", "faq"].includes(type)) {
      return res.status(400).json({ message: "Invalid content type" });
    }
    const items = await Content.find({ type, isActive: true }).sort({
      order: 1,
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getContentByType };
