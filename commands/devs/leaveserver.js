const isDev = require("../../utils/devCheck");
const { createEmbed, colors } = require("../../utils/embedHandler");
const emojis = require("../../utils/emojis");

module.exports = {
  name: "leaveserver",
  category: "devs",
  description: "Force bot to leave a server",

  async execute(client, message, args) {
    if (!isDev(message.author.id)) return;

    const query = args[0];
    if (!query) {
      return message.channel.send({
        embeds: [createEmbed(
          ` Invalid Usage`,
          "Please provide a Server ID or Invite Link.",
          colors.error
        )]
      });
    }

    let guild;
    if (query.includes("discord.gg") || query.includes("discord.com/invite")) {
      const invite = await client.fetchInvite(query).catch(() => null);
      if (invite) guild = client.guilds.cache.get(invite.guild.id);
    } else {
      guild = client.guilds.cache.get(query);
    }

    if (!guild) {
      return message.channel.send({
        embeds: [createEmbed(null, `${emojis.error} I am not in that server.`, colors.error)]
      });
    }

    const guildName = guild.name;
    const owner = await guild.fetchOwner().catch(() => null);

    if (owner) {
      const informEmbed = createEmbed(
        "Notice",
        `Hello, I have been instructed by my developers to leave **${guildName}**. If you have questions, please join our support server.`,
        "#F04747"
      );
      await owner.send({ embeds: [informEmbed] }).catch(() => {});
    }

    await guild.leave();
    
    return message.channel.send({
      embeds: [createEmbed(
        `${emojis.success} Left Server`,
        `Successfully left **${guildName}** (\`${guild.id}\`).`,
        colors.success
      )]
    });
  }
};
