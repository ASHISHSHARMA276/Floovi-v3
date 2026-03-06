const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "queue",
  aliases: ["q"],
  category: "music",
  description: "Display the current music queue",

  async execute(client, message) {
    const player = client.manager.players.get(message.guild.id);
    if (!player || !player.queue.length) {
      const current = player?.current;
      if (!current) {
        return message.channel.send({ embeds: [createEmbed(null, "❌ The queue is empty.", colors.error)] });
      }
      return message.channel.send({
        embeds: [createEmbed(
          "🎵 Current Queue",
          `**Now Playing:** [${current.title}](${current.uri})\n\n*The queue is otherwise empty.*`,
          colors.primary,
          { text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() }
        )]
      });
    }

    const queueList = player.queue.slice(0, 10).map((track, index) => {
      return `\`${index + 1}.\` [${track.title}](${track.uri}) - \`${Math.floor(track.length / 60000)}:${Math.floor((track.length / 1000) % 60).toString().padStart(2, "0")}\``;
    }).join("\n");

    const embed = createEmbed(
      "🎵 Music Queue",
      `**Now Playing:** [${player.current?.title || "Unknown"}](${player.current?.uri || "#"})\n\n**Up Next:**\n${queueList}${player.queue.length > 10 ? `\n\n*and ${player.queue.length - 10} more songs...*` : ""}`,
      colors.primary,
      { text: `Total Songs: ${player.queue.length} | Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() }
    );

    message.channel.send({ embeds: [embed] });
  }
};
