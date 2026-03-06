const isDev = require("../../utils/devCheck");
const User = require("../../database/models/User");
const { createEmbed, colors } = require("../../utils/embedHandler");

function parseTime(str) {
  if (str === "permanent") return null;
  const num = parseInt(str);
  if (str.endsWith("m")) return Date.now() + num * 60 * 1000;
  if (str.endsWith("h")) return Date.now() + num * 60 * 60 * 1000;
  if (str.endsWith("d")) return Date.now() + num * 24 * 60 * 60 * 1000;
  return null;
}

module.exports = {
  name: "noprefix",
  category: "devs",
  description: "Add or remove noprefix with time limit",

  async execute(client, message, args) {
    const config = require("../../config/config");
    const isAdmin = config.Admin && config.Admin.includes(message.author.id);
    if (!isDev(message.author.id) && !isAdmin) return;

    const action = args[0];
    const user = message.mentions.users.first() || (args[1] && await client.users.fetch(args[1]).catch(() => null));

    if (!action || !user) {
      const usageEmbed = createEmbed(
        "❌ Invalid Usage",
        `**Usage:** \`noprefix <add|remove> <user> [time|permanent]\`\n\n**Examples:**\n\`noprefix add @user 1d\`\n\`noprefix add @user permanent\`\n\`noprefix remove @user\``,
        colors.error
      );
      return message.channel.send({ embeds: [usageEmbed] });
    }

    let data = await User.findOne({ userId: user.id });
    if (!data) data = await User.create({ userId: user.id });

    if (action === "add") {
      if (data.noPrefix && (!data.noPrefixUntil || data.noPrefixUntil > Date.now())) {
        const timeStr = data.noPrefixUntil ? `<t:${Math.floor(data.noPrefixUntil / 1000)}:R>` : "permanently";
        return message.channel.send({
          embeds: [createEmbed("Information", `**${user.username}** already has no-prefix access ${timeStr}.`, colors.info)]
        });
      }

      const timeArg = args[2] || "permanent";
      data.noPrefix = true;
      data.noPrefixUntil = parseTime(timeArg);
      await data.save();

      const embed = createEmbed(
        "✨ No-Prefix Added",
        `Successfully granted **No-Prefix** access to **${user.username}**.`,
        "#2B2D31",
        null,
        null,
        user.displayAvatarURL()
      );
      embed.setFooter({ text: "Developer Action", iconURL: message.author.displayAvatarURL() });
      return message.channel.send({ embeds: [embed] });
    }

    if (action === "remove") {
      if (!data.noPrefix) {
        return message.channel.send({
          embeds: [createEmbed("Information", `**${user.username}** does not have no-prefix access.`, colors.info)]
        });
      }
      data.noPrefix = false;
      data.noPrefixUntil = null;
      await data.save();

      const embed = createEmbed(
        "🚫 No-Prefix Removed",
        `Successfully revoked **No-Prefix** access from **${user.username}**.`,
        "#F04747",
        null,
        null,
        user.displayAvatarURL()
      );
      embed.setFooter({ text: "Developer Action", iconURL: message.author.displayAvatarURL() });
      return message.channel.send({ embeds: [embed] });
    }
  }
};
