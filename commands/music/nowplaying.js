const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "nowplaying",
  aliases: ["np"],
  category: "music",
  description: "Show current playing song",

  async execute(client, message) {
    const player = client.manager.players.get(message.guild.id);
    if (!player || !player.current)
      return message.channel.send({ embeds: [createEmbed(null, "❌ No song is playing.", colors.error)] });

    const track = player.current;
    
    const embed = createEmbed(
      null,
      `**[${track.title}](${track.uri})**`,
      "#2B2D31",
      { text: `Requested by ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL() },
      { name: "Now Playing", iconURL: client.user.displayAvatarURL() },
      track.thumbnail,
      [
        { name: "Author", value: `\`${track.author}\``, inline: true },
        { name: "Duration", value: `\`${Math.floor(track.length / 60000)}:${Math.floor((track.length / 1000) % 60).toString().padStart(2, "0")}\``, inline: true }
      ]
    );

    message.channel.send({ embeds: [embed] });
  }
};
