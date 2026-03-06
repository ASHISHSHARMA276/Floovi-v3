const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  noPrefix: { type: Boolean, default: false },
  noPrefixUntil: { type: Number, default: null },
  isPremium: { type: Boolean, default: false },
  premiumUntil: { type: Date, default: null },
  globalBan: { type: Boolean, default: false },
  blacklisted: { type: Boolean, default: false },
  customBot: {
    type: Object,
    default: {}
  }
}, { minimize: false });

module.exports = mongoose.model("User", UserSchema);
