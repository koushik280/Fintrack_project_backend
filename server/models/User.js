const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    isBlocked: { type: Boolean, default: false },
    subscription: {
      plan: { type: String, enum: ["free", "pro"], default: "free" },
      status: {
        type: String,
        enum: ["active", "expired", "canceled"],
        default: "active",
      },
      startDate: { type: Date, default: Date.now() },
      endDate: { type: Date },
    },

    bio: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
