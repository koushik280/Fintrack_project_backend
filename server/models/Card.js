const mongoose = require("mongoose");
const cardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      requried: true,
    },
    nickname: {
      type: String,
      requried: true,
      trim: true,
    },
    lastFour: {
      type: String,
      requried: true,
      minlength: 4,
      maxlength: 4,
    },
    bank: {
      type: String,
      requried: true,
    },
    type: {
      type: String,
      enum: ["Visa", "Mastercard", "Amex", "Discover"],
      requried: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Card", cardSchema);

