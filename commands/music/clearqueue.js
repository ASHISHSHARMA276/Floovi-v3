const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "clearqueue",
  aliases: ["clear", "cq"],
  category: "music",
  description: "Clear all songs from the music queue",

  async execute(client, message) {
    const player = client.manager.players.get(message.guild.id);
    if (!player) {
      return message.channel.send({ embeds: [createEmbed(null, "❌ No music is currently playing.", colors.error)] });
    }

    if (!player.queue.length) {
      return message.channel.send({ embeds: [createEmbed(null, "❌ The queue is already empty.", colors.error)] });
    }

    player.queue.clear();

    const embed = createEmbed(
      "🗑️ Queue Cleared",
      "Successfully removed all songs from the queue.",
      colors.success,
      { text: `Action by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() }
    );

    message.channel.send({ embeds: [embed] });
  }
};
