const { EmbedBuilder } = require("discord.js");
const { colors } = require("../../utils/embedHandler");
const emojis = require("../../utils/emojis");

module.exports = {
  name: "stats",
  category: "info",
  description: "Shows team and bot information",

  async execute(client, message) {

    const totalUsers = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );

    const embed = new EmbedBuilder()
      .setColor(colors?.primary || "#2f3136")
      .setAuthor({
        name: "Floovi Information Panel",
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `**${emojis.devs} _Developer_**\n` +
        `**${emojis.dot} Unstoppable \`</>\`**\n` +
        `**Status: ● Online**\n` +
        `**Activity: None**\n\n` +

        `**${emojis.star} _Owner_**\n` +
        `**${emojis.arrow} [1] Ashish**\n` +
        `**${emojis.arrow} [2] Unstoppable**\n\n` +

        `**${emojis.help} _Team_**\n` +
        `**${emojis.arrow} [1] Royal**\n\n` +

        `━━━━━━━━━━━━━━━━━━\n\n` +

        `**${emojis.info} _Bot Information_**\n` +
        `**${emojis.dot} Bot Username : ${client.user.username}**\n` +
        `**${emojis.dot} Servers : ${client.guilds.cache.size}**\n` +
        `**${emojis.dot} Users : ${totalUsers}**\n` +
        `**${emojis.dot} Ping : ${client.ws.ping} ms**`
      )
      .setFooter({
        text: `Requested By : ${message.author.username}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  },
};
