const { createEmbed, colors } = require("../../utils/embedHandler");
const Guild = require("../../database/models/Guild");

module.exports = {
  name: "247",
  aliases: ["stay", "alwayson"],
  category: "music",
  description: "Toggles 24/7 mode for the music player",

  async execute(client, message, args) {
    const premiumCheck = require("../../utils/premiumCheck");
    const isPremium = await premiumCheck(message.author.id);
    
    if (!isPremium) {
      return message.channel.send({ 
        embeds: [createEmbed(
          "💎 Premium Feature",
          "24/7 mode is a **Premium Only** feature. \nUse `!premium` to upgrade!",
          "#FFD700"
        )] 
      });
    }

    const player = client.manager.players.get(message.guild.id);
    if (!player) return message.channel.send({ embeds: [createEmbed(null, "❌ No player found for this guild.", colors.error)] });

    player.twentyFourSeven = !player.twentyFourSeven;
    
    await Guild.findOneAndUpdate(
      { guildId: message.guild.id },
      { 
        twentyFourSeven: player.twentyFourSeven,
        voiceChannelId: player.twentyFourSeven ? player.voiceId : null,
        textId: player.twentyFourSeven ? player.textId : null
      },
      { upsert: true }
    );
    
    const embed = createEmbed(
      "24/7 Mode Toggled !",
      `> 24/7 mode is now **${player.twentyFourSeven ? "enabled" : "disabled"}** ☑️`,
      "#2B2D31",
      null,
      { name: `Requested by ${message.author.username} • Today at ${require("moment")().format("HH:mm")}`, iconURL: message.author.displayAvatarURL() }
    );

    return message.channel.send({ embeds: [embed] });
  }
};
