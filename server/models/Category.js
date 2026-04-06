const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["system", "user"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null for system categories
    isActive: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
    categoryType: {
      type: String,
      enum: ["income", "expense"],
      default: "expense",
    }, // admin moderation flag
  },
  { timestamps: true },
);

// Compound unique index: same user cannot have two categories with the same name
categorySchema.index(
  { user: 1, name: 1 },
  { unique: true, partialFilterExpression: { user: { $ne: null } } },
);
// System categories names must be unique
categorySchema.index({ name: 1, type: "system" }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
