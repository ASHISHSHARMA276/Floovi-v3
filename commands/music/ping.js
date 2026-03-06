const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "ping",
  category: "music",
  description: "Check bot latency",
  async execute(client, message) {
    const embed = createEmbed(
      "🏓 Pong!",
      `**Latency:** \`${client.ws.ping}ms\``,
      colors.primary,
      { text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() }
    );
      
    message.channel.send({ embeds: [embed] });
  }
};
