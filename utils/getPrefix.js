const User = require("../database/models/User");
const Guild = require("../database/models/Guild");
const config = require("../config/config");

module.exports = async (guildId, userId) => {
  try {
    const user = await User.findOne({ userId }).lean();
    if (user && user.noPrefix) {
      if (user.noPrefixUntil && Date.now() > user.noPrefixUntil) {
        await User.updateOne({ userId }, { noPrefix: false, noPrefixUntil: null });
      } else {
        // Only return empty prefix if the user is NOT using a regular prefix
        // We will check this in the message handler instead to allow both
      }
    }

    const guild = await Guild.findOne({ guildId }).lean();
    const currentPrefix = guild?.prefix || config.prefix || "!";
    return currentPrefix;
  } catch (error) {
    console.error("Error fetching prefix:", error);
    return config.prefix || "!";
  }
};
