const { createEmbed, colors } = require("../../utils/embedHandler");
const moment = require("moment");

module.exports = {
  name: "autoplay",
  aliases: ["ap"],
  category: "music",
  description: "Toggle professional autoplay feature",

  async execute(client, message) {
    // 1. Get the player for the guild
    const player = client.manager.players.get(message.guild.id);

    // 2. Error check: Is there a player/music playing?
    if (!player) {
      return message.channel.send({
        embeds: [createEmbed(null, "❌ No music is currently playing.", colors.error)]
      });
    }

    // 3. Toggle the autoplay state in player.data
    const currentState = player.data.get("autoplay") || false;
    const newState = !currentState;
    player.data.set("autoplay", newState);

    // 4. Determine the status text and color
    const status = newState ? "Enabled" : "Disabled";
    const embedColor = newState ? "#2f3136" : colors.error;

    // 5. Create the response embed
    const embed = createEmbed(
      "Autoplay System",
      `> Autoplay has been **${status}** for this session.\n\n*When the queue is empty, I will automatically find and play similar tracks from YouTube.*`,
      embedColor,
      null,
      { 
        name: `Action by ${message.author.username}`, 
        iconURL: message.author.displayAvatarURL({ dynamic: true }) 
      }
    );

    // 6. Send the confirmation
    return message.channel.send({ embeds: [embed] });
  }
};
/// ASHISH DONE AUTOPLAY SYSTEM
/// ASHISH DEVS </>