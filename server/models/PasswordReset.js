const mongoose = require("mongoose");
const passwordResetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 3600000,
    },
  },
  { timestamps: true },
);


passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports=mongoose.model("PasswordReset", passwordResetSchema);

