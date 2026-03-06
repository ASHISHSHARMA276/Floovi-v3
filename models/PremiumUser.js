const mongoose = require("mongoose");

const PremiumUserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  expiresAt: { type: Date, default: null },
  isLifetime: { type: Boolean, default: false }
});

module.exports = mongoose.model("PremiumUser", PremiumUserSchema);
