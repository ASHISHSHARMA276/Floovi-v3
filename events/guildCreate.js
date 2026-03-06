const { logGuildJoin } = require("../utils/webhook");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createEmbed } = require("../utils/embedHandler");
const config = require("../config/config");

module.exports = (client) => {
  client.on("guildCreate", async (guild) => {
    // Log join
    await logGuildJoin(guild);

    // Send thanks message to owner
    setTimeout(async () => {
      try {
        const owner = await guild.fetchOwner();
        if (!owner) return;
        
        const embed = createEmbed(
          `Hey I'm Floovi, The bot you need.`,
          `<:arrow:1476141674546860155> Thanks for adding!\n<:arrow:1476141674546860155> My default prefix is \`${config.prefix}\`\n<:arrow:1476141674546860155> Use \`${config.prefix}help\` or \`/help\` in the server for commands\n<:arrow:1476141674546860155> For questions or details join [Support server](https://discord.gg/tTApbU2GNj)`,
          "#2B2D31",
          { text: `By Floovi Development`, iconURL: client.user.displayAvatarURL() },
          null,
          client.user.displayAvatarURL()
        );

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Support Server')
            .setURL('https://discord.gg/tTApbU2GNj')
            .setStyle(ButtonStyle.Link)
        );

        await owner.send({ embeds: [embed], components: [row] }).catch(err => {
          console.error(`Could not DM owner of ${guild.name}:`, err.message);
        });
      } catch (err) {
        console.error("Failed to send thanks message to owner:", err);
      }
    }, 2000);
  });
};
