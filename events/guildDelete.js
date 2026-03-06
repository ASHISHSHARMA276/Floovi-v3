const { logGuildLeave } = require("../utils/webhook");

module.exports = (client) => {
  client.on("guildDelete", async (guild) => {
    await logGuildLeave(guild);
  });
};
