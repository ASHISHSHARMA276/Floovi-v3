const emojis = require("../../utils/emojis");
const { EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const devCheck = require("../../utils/devCheck");

module.exports = {
  name: "addpremium",
  aliases: ["givepremium", "setpremium"],
  category: "devs",
  description: "Add premium status to a user (Developer Only)",

  async execute(client, message, args) {
    const config = require("../../config/config");
    const isAdmin = config.Admin && config.Admin.includes(message.author.id);
    if (!devCheck(message.author.id) && !isAdmin) {
      return message.channel.send({ 
        embeds: [new EmbedBuilder().setColor("#ff0000").setDescription("<:Cross:1476141249818923029> This command is restricted to bot developers and co-owners.")] 
      });
    }

    const targetUser = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!targetUser) return message.channel.send("<:Cross:1476141249818923029> Please mention a user or provide a valid user ID.");

    let user = await User.findOne({ userId: targetUser.id });
    if (!user) user = await User.create({ userId: targetUser.id });

    user.isPremium = true;
    user.premiumUntil = args[1] ? new Date(Date.now() + parseInt(args[1]) * 24 * 60 * 60 * 1000) : null;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setAuthor({ name: "Premium Added", iconURL: targetUser.displayAvatarURL() })
      .setDescription(`☑️ Successfully added **Premium** status to **${targetUser.tag}**.`)
      .addFields({ name: "Duration", value: args[1] ? `${args[1]} Days` : "Permanent" })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
