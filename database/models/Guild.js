const mongoose = require("mongoose");

const GuildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: "!" },
  blacklisted: { type: Boolean, default: false },
  twentyFourSeven: { type: Boolean, default: false },
  voiceChannelId: { type: String, default: null },
  textId: { type: String, default: null },
  ignoredChannels: { type: [String], default: [] },
  bypassUsers: { type: [String], default: [] },
  bypassRoles: { type: [String], default: [] }
});

module.exports = mongoose.model("Guild", GuildSchema);
