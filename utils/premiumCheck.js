const User = require("../database/models/User");

/**
 * Checks if a user has premium status
 * @param {string} userId - The Discord user ID
 * @returns {Promise<boolean>}
 */
module.exports = async (userId) => {
  try {
    const user = await User.findOne({ userId }).lean();
    return !!(user && user.isPremium);
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
};
