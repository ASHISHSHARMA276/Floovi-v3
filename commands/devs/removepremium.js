const emojis = require("../../utils/emojis");
const { EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const devCheck = require("../../utils/devCheck");

module.exports = {
  name: "removepremium",
  aliases: ["depremium"],
  category: "devs",
  description: "Remove premium status from a user (Developer Only)",

  async execute(client, message, args) {
    if (!devCheck(message.author.id)) {
      return message.channel.send({ 
        embeds: [new EmbedBuilder().setColor("#ff0000").setDescription("<:Cross:1476141249818923029> This command is restricted to bot developers.")] 
      });
    }

    const targetUser = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
    if (!targetUser) return message.channel.send("<:Cross:1476141249818923029> Please mention a user or provide a valid user ID.");

    const user = await User.findOne({ userId: targetUser.id });
    if (!user || !user.isPremium) return message.channel.send("<:Cross:1476141249818923029> This user does not have premium status.");

    user.isPremium = false;
    user.premiumUntil = null;
    await user.save();

    const embed = new EmbedBuilder()
      .setColor("#ff0000")
      .setDescription(`☑️ Successfully removed **Premium** status from **${targetUser.tag}**.`)
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
