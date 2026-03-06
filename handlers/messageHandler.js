const getPrefix = require("../utils/getPrefix");
const blacklistCheck = require("../utils/blacklistCheck");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    // REMOVED: console.log for all messages to keep console clean
    // The webhook logging below handles command tracking

    const prefix = await getPrefix(message.guild.id, message.author.id);
    const User = require("../database/models/User");
    const user = await User.findOne({ userId: message.author.id }).lean();
    const hasNoPrefix = user && user.noPrefix && (!user.noPrefixUntil || Date.now() < user.noPrefixUntil);

    const mentionPrefix = `<@!${client.user.id}>`;
    const mentionPrefixAlt = `<@${client.user.id}>`;

    let usedPrefix = null;
    const msgContent = message.content.trim();

    // Priority 1: Check for mention prefixes
    if (msgContent.startsWith(mentionPrefix)) {
        usedPrefix = mentionPrefix;
    } 
    else if (msgContent.startsWith(mentionPrefixAlt)) {
        usedPrefix = mentionPrefixAlt;
    } 

    if (usedPrefix !== null && msgContent === usedPrefix) {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
        const { createEmbed, colors } = require("../utils/embedHandler");
        
        const embed = createEmbed(
            `Hey I'm Floovi, The bot you need.`,
            `• My prefix is \`${prefix}\`\n• For Help Guide type \`${prefix}help\` | \`/help\``,
            "#2B2D31",
            { text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() },
            null,
            client.user.displayAvatarURL()
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Me')
                    .setURL('https://discord.com/oauth2/authorize?client_id=1462008990195126283&permissions=8&integration_type=0&scope=bot')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setURL('https://discord.gg/tTApbU2GNj')
                    .setStyle(ButtonStyle.Link),
            );

        return message.channel.send({ embeds: [embed], components: [row] });
    }

    // Priority 2: Check for actual guild prefix
    if (usedPrefix === null && msgContent.startsWith(prefix)) {
        usedPrefix = prefix;
    }

    // Priority 3: Check for noprefix (empty string) - only if no other prefix matched
    if (usedPrefix === null && hasNoPrefix) {
        // We need to check if the first word is a valid command name or alias
        const argsCheck = msgContent.split(/ +/);
        const commandNameCheck = argsCheck[0].toLowerCase();
        const commandCheck = client.commands.get(commandNameCheck) || 
                        client.commands.find(cmd => cmd.aliases && Array.isArray(cmd.aliases) && cmd.aliases.includes(commandNameCheck));
        
        if (commandCheck) {
            usedPrefix = "";
        }
    }

    if (usedPrefix === null) return;

    // Handle Custom Bot Appearance for Premium Users
    if (user && user.isPremium && user.customBot) {
        const guildId = message.guild.id;
        const userCustom = user.customBot[guildId];
        
        if (userCustom) {
            if (userCustom.status) {
                client.user.setPresence({ status: userCustom.status });
            }
            if (userCustom.name && message.guild.members.me.nickname !== userCustom.name) {
                try {
                    await message.guild.members.me.setNickname(userCustom.name);
                } catch (e) {}
            }
        }
    }

    const Guild = require("../database/models/Guild");
    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (guildData && guildData.ignoredChannels.includes(message.channel.id)) {
      const config = require("../config/config");
      const isAdmin = config.Admin && config.Admin.includes(message.author.id);
      const isOwner = message.guild.ownerId === message.author.id;
      const hasBypass = guildData.bypassUsers.includes(message.author.id) || 
                        message.member.roles.cache.some(role => guildData.bypassRoles.includes(role.id));
      
      if (!isAdmin && !isOwner && !hasBypass) {
        const { createEmbed } = require("../utils/embedHandler");
        const embed = createEmbed(
            null,
            "❌ This channel is in the ignore list.",
            "#F04747"
        );
        const msg = await message.channel.send({ embeds: [embed] });
        setTimeout(() => msg.delete().catch(() => {}), 3000);
        return;
      }
    }

    const args = msgContent.slice(usedPrefix.length).trim().split(/ +/);
    if (usedPrefix === "" && args.length === 0) return; 

    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && Array.isArray(cmd.aliases) && cmd.aliases.includes(commandName));

    const config = require("../config/config");
    const isAdmin = config.Admin && config.Admin.includes(message.author.id);

    // Logging to Webhook instead of console
    if (process.env.LOG_WEBHOOK_URL) {
      const { WebhookClient } = require("discord.js");
      const webhook = new WebhookClient({ url: process.env.LOG_WEBHOOK_URL });
      webhook.send({
        content: `**Command:** ${commandName} | **User:** ${message.author.tag} (${message.author.id}) | **Guild:** ${message.guild.name} (${message.guild.id})`,
        username: "Bot Logs",
        avatarURL: client.user.displayAvatarURL()
      }).catch(() => {});
    }

    if (!command) return;

    // Admin/Co-owner check for specific commands
    const adminCommands = ["noprefix", "addpremium", "removepremium", "premium", "blacklist", "coowner"];
    if (adminCommands.includes(commandName) && !isAdmin) {
      return message.channel.send("❌ You do not have permission to use this command.");
    }

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      message.channel.send("❌ There was an error executing that command.");
    }
  });
};
