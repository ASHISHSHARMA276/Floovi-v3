const isDev = require("../../utils/devCheck");
const User = require("../../database/models/User");
const Guild = require("../../database/models/Guild");

module.exports = {
  name: "blacklist",
  category: "devs",
  description: "Blacklist user or server",

  async execute(client, message, args) {
    if (!isDev(message.author.id)) return;

    const type = args[0];    // user | server
    const action = args[1];  // add | remove

    if (!type || !action)
      return message.channel.send("Usage: blacklist <user|server> <add|remove> [user]");

    // SERVER BLACKLIST
    if (type === "server") {
      let data = await Guild.findOne({ guildId: message.guild.id });
      if (!data) data = await Guild.create({ guildId: message.guild.id });

      data.blacklisted = action === "add";
      await data.save();

      return message.channel.send(
        `🚫 Server blacklist **${action.toUpperCase()}**`
      );
    }

    // USER BLACKLIST
    if (type === "user") {
      const user =
        message.mentions.users.first() ||
        (args[2] && await client.users.fetch(args[2]).catch(() => null));

      if (!user)
        return message.channel.send("Provide a valid user.");

      let data = await User.findOne({ userId: user.id });
      if (!data) data = await User.create({ userId: user.id });

      data.blacklisted = action === "add";
      await data.save();

      return message.channel.send(
        `🚫 User **${user.tag}** blacklist **${action.toUpperCase()}**`
      );
    }
  }
};
