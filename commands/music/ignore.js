const { createEmbed, colors } = require("../../utils/embedHandler");
const Guild = require("../../database/models/Guild");

module.exports = {
  name: "ignore",
  aliases: ["ignorechannel"],
  category: "utility",
  description: "Add or remove channels/users from the ignore list",

  async execute(client, message, args) {
    if (!message.member.permissions.has("Administrator")) {
      const embed = createEmbed(null, "❌ You need `Administrator` permissions to use this command.", colors.error);
      return message.channel.send({ embeds: [embed] });
    }

    const subCommand = args[0]?.toLowerCase();
    if (!["add", "remove", "list", "bypass"].includes(subCommand)) {
      const embed = createEmbed("Ignore Command Help", 
        `\`ignore add [#channel]\` - Add channel to ignore list\n\`ignore remove [#channel]\` - Remove channel from ignore list\n\`ignore list\` - List all ignored channels\n\`ignore bypass <user|role> <add|remove> <mention/ID>\` - Manage bypass list`, 
        "#2B2D31");
      return message.channel.send({ embeds: [embed] });
    }

    if (subCommand === "add") {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel;
      await Guild.findOneAndUpdate(
        { guildId: message.guild.id },
        { $addToSet: { ignoredChannels: channel.id } },
        { upsert: true }
      );
      const embed = createEmbed(null, `✅ Added <#${channel.id}> to the ignore list.`, colors.success);
      return message.channel.send({ embeds: [embed] });
    }

    if (subCommand === "remove") {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel;
      await Guild.findOneAndUpdate(
        { guildId: message.guild.id },
        { $pull: { ignoredChannels: channel.id } },
        { upsert: true }
      );
      const embed = createEmbed(null, `✅ Removed <#${channel.id}> from the ignore list.`, colors.success);
      return message.channel.send({ embeds: [embed] });
    }

    if (subCommand === "list") {
      const guildData = await Guild.findOne({ guildId: message.guild.id });
      const channels = guildData?.ignoredChannels?.map(id => `<#${id}>`).join(", ") || "None";
      const users = guildData?.bypassUsers?.map(id => `<@${id}>`).join(", ") || "None";
      const roles = guildData?.bypassRoles?.map(id => `<@&${id}>`).join(", ") || "None";
      
      const embed = createEmbed("🚫 Guild Ignore Settings", null, "#2B2D31", null, null, null, [
        { name: "Ignored Channels", value: channels },
        { name: "Bypass Users", value: users, inline: true },
        { name: "Bypass Roles", value: roles, inline: true }
      ]);
      return message.channel.send({ embeds: [embed] });
    }

    if (subCommand === "bypass") {
      const type = args[1]?.toLowerCase(); // user or role
      const action = args[2]?.toLowerCase(); // add or remove
      const target = message.mentions.users.first() || message.mentions.roles.first() || args[3];

      if (!["user", "role"].includes(type) || !["add", "remove"].includes(action) || !target) {
        const embed = createEmbed(null, "❌ Usage: `ignore bypass <user|role> <add|remove> <mention/ID>`", colors.error);
        return message.channel.send({ embeds: [embed] });
      }

      const targetId = typeof target === "string" ? target : target.id;
      const updateField = type === "user" ? "bypassUsers" : "bypassRoles";
      const updateOp = action === "add" ? "$addToSet" : "$pull";

      await Guild.findOneAndUpdate(
        { guildId: message.guild.id },
        { [updateOp]: { [updateField]: targetId } },
        { upsert: true }
      );

      const embed = createEmbed(null, `✅ ${action === "add" ? "Added" : "Removed"} ${type} bypass for **${typeof target === "string" ? targetId : (target.tag || target.name)}**.`, colors.success);
      return message.channel.send({ embeds: [embed] });
    }
  }
};
