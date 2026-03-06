const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "stop",
  aliases: ["end", "dc", "leave"],
  category: "music",
  description: "Stop music and clear queue",

  async execute(client, message) {
    const player = client.manager.players.get(message.guild.id);
    if (!player) {
      return message.channel.send({ 
        embeds: [createEmbed(null, "❌ No music is currently playing.", colors.error)] 
      });
    }

    player.destroy();
    
    const embed = createEmbed(
      null,
      "⏹️ **Stopped the music and cleared the queue.**",
      colors.primary,
      { text: `Stopped by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() },
      { name: "Music Stopped", iconURL: client.user.displayAvatarURL() }
    );

    message.channel.send({ embeds: [embed] });
  }
};
