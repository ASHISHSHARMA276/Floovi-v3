const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "skip",
  aliases: ["s"],
  category: "music",
  description: "Skip the current song professionally",

  async execute(client, message) {
    const player = client.manager.players.get(message.guild.id);
    if (!player || !player.playing) {
      return message.channel.send({ 
        embeds: [createEmbed(null, "❌ There is no song playing to skip.", colors.error)] 
      });
    }

    const skippedTrack = player.queue.current;
    player.skip();

    const moment = require("moment");
    const embed = createEmbed(
      "Track Skipped !",
      `> Successfully skipped track **${skippedTrack.title}**  \`~ 0.12s\``,
      "#2B2D31",
      null,
      { name: `Skipped by ${message.author.username} • Today at ${moment().format("HH:mm")}`, iconURL: message.author.displayAvatarURL() }
    );
    message.channel.send({ embeds: [embed] });
  }
};
