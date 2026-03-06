const emojis = require("../../utils/emojis");
const { EmbedBuilder } = require("discord.js");
const premiumCheck = require("../../utils/premiumCheck");

module.exports = {
  name: "enhance",
  aliases: ["hq"],
  category: "music",
  description: "Apply high-quality audio enhancement (Premium Only)",

  async execute(client, message, args) {
    const isPremium = await premiumCheck(message.author.id);
    if (!isPremium) {
      return message.channel.send({ 
        embeds: [new EmbedBuilder()
          .setColor("#FFD700")
          .setTitle("💎 Premium Feature")
          .setDescription("This command is only available for **Premium Users**. \nUpgrade to Premium for an ads-free experience and high-quality audio!")
        ] 
      });
    }

    const player = client.manager.players.get(message.guild.id);
    if (!player) return message.channel.send({ embeds: [new EmbedBuilder().setColor("#ff0000").setDescription("<:Cross:1476141249818923029> No music playing.")] });

    // Enhancement logic using Shoukaku filters
    player.shoukaku.setFilters({
      equalizer: [
        { band: 0, gain: 0.25 },
        { band: 1, gain: 0.5 },
        { band: 2, gain: -0.25 },
        { band: 3, gain: 0 },
        { band: 4, gain: 0 },
        { band: 5, gain: -0.0125 },
        { band: 6, gain: -0.025 },
        { band: 7, gain: -0.0175 },
        { band: 8, gain: 0 },
        { band: 9, gain: 0 },
        { band: 10, gain: 0.0125 },
        { band: 11, gain: 0.025 },
        { band: 12, gain: 0.375 },
        { band: 13, gain: 0.125 },
      ]
    });

    message.channel.send({ 
      embeds: [new EmbedBuilder()
        .setColor("#5865F2")
        .setDescription("<:star:1476141482330165268> **Audio Enhancement Applied!** High-fidelity sound enabled for Premium members.")
      ] 
    });
  },
};
