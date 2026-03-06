const isDev = require("../../utils/devCheck");
const User = require("../../database/models/User");

module.exports = {
  name: "globalban",
  category: "devs",
  description: "Globally ban or unban a user",

  async execute(client, message, args) {
    if (!isDev(message.author.id)) return;

    const action = args[0];
    const user =
      message.mentions.users.first() ||
      (args[1] && await client.users.fetch(args[1]).catch(() => null));

    if (!action || !user)
      return message.channel.send("Usage: globalban <add|remove> <user>");

    let data = await User.findOne({ userId: user.id });
    if (!data) data = await User.create({ userId: user.id });

    if (action === "add") {
      data.globalBan = true;
      await data.save();
      return message.channel.send(`🚫 **${user.tag}** globally banned.`);
    }

    if (action === "remove") {
      data.globalBan = false;
      await data.save();
      return message.channel.send(`✅ **${user.tag}** unbanned globally.`);
    }
  }
};
