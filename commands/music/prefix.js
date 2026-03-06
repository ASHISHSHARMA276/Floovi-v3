const Guild = require("../../database/models/Guild");
const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "setprefix",
  aliases: ["prefix"],
  category: "music",
  description: "Change the bot prefix for this server",

  async execute(client, message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.channel.send({ embeds: [createEmbed(null, "❌ You need `Administrator` permissions to change the prefix.", colors.error)] });
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      return message.channel.send({ embeds: [createEmbed(null, "❌ Please provide a new prefix.", colors.error)] });
    }
    
    if (newPrefix.length > 5) {
      return message.channel.send({ embeds: [createEmbed(null, "❌ Prefix cannot be longer than 5 characters.", colors.error)] });
    }

    let guild = await Guild.findOne({ guildId: message.guild.id });
    if (!guild) guild = await Guild.create({ guildId: message.guild.id });

    guild.prefix = newPrefix;
    await guild.save();

    const embed = createEmbed(
      "✅ Prefix Updated",
      `The bot prefix for this server has been set to: \`${newPrefix}\``,
      colors.success,
      { text: `Action by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() }
    );

    message.channel.send({ embeds: [embed] });
  }
};
