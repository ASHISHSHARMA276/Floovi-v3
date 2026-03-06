const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "users",
  aliases: ["u"],
  category: "info",
  description: "Show real-time users of the bot",

  async execute(client, message) {
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const totalGuilds = client.guilds.cache.size;
    
    const embed = createEmbed(
      "👥 Bot Statistics",
      `**Total Users:** ${totalUsers.toLocaleString()}\n**Total Servers:** ${totalGuilds.toLocaleString()}`,
      colors.primary,
      { text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() }
    );

    message.channel.send({ embeds: [embed] });
  }
};
