const axios = require("axios");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const User = require("../../database/models/User");
const { createEmbed, colors } = require("../../utils/embedHandler");
const emojis = require("../../utils/emojis");

const cooldowns = new Map();

module.exports = {
  name: "customize",
  aliases: ["branding"],
  category: "premium",
  description: "Manage the bot's server profile.",

  async execute(client, message, args) {
    if (!message.guild) return;

    // Premium Check
    const user = await User.findOne({ userId: message.author.id });
    const isPremium = user && user.isPremium && (!user.premiumUntil || user.premiumUntil > Date.now());

    if (!isPremium) {
      return message.reply({ embeds: [createEmbed(null, "❌ This command is restricted to Premium users.", colors.error)] });
    }

    // Permission check: Server Owner or ManageGuild (Python used is_server_owner)
    if (message.author.id !== message.guild.ownerId && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply({ embeds: [createEmbed(null, "❌ You need to be the server owner or have Manage Server permission.", colors.error)] });
    }

    const sub = args[0]?.toLowerCase();
    if (!sub || !["avatar", "banner", "bio", "reset"].includes(sub)) {
      const helpEmbed = new EmbedBuilder()
        .setColor(colors.primary || "#5865F2")
        .setTitle("🖌️ Branding Customization")
        .setDescription("Manage how the bot looks in this server.")
        .addFields(
          { name: "Commands", value: "`customize avatar <url>`\n`customize banner <url>`\n`customize bio <text>`\n`customize reset <avatar|banner|bio|all>`" }
        );
      return message.channel.send({ embeds: [helpEmbed] });
    }

    // Cooldown
    const guildId = message.guild.id;
    const now = Date.now();
    const cooldownAmount = (sub === "reset" ? 6 : 12) * 1000;
    if (cooldowns.has(`${guildId}-${sub}`)) {
      const expirationTime = cooldowns.get(`${guildId}-${sub}`) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - now) / 1000);
        return message.reply(`⏳ Please wait ${timeLeft}s before using this subcommand again.`);
      }
    }

    const formatImage = async (url) => {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
        if (!contentType.startsWith('image/')) return { error: "Link is not a valid image." };
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return { data: `data:${contentType};base64,${base64}` };
      } catch (e) {
        return { error: "Failed to download image. Check the URL." };
      }
    };

    const processBranding = async (payload) => {
      try {
        // Using Discord API directly as per the Python script's logic
        const response = await axios.patch(
          `https://discord.com/api/v10/guilds/${guildId}/members/@me`,
          payload,
          {
            headers: {
              Authorization: `Bot ${client.token}`,
              "Content-Type": "application/json"
            }
          }
        );
        return { success: true };
      } catch (e) {
        const errorData = e.response?.data;
        return { error: errorData ? JSON.stringify(errorData) : e.message };
      }
    };

    try {
      if (sub === "avatar" || sub === "banner") {
        const url = args[1];
        if (!url) return message.reply("❌ Please provide a valid image URL.");
        
        const { data, error } = await formatImage(url);
        if (error) return message.reply(`❌ ${error}`);

        const result = await processBranding({ [sub]: data });
        if (result.error) return message.reply(`❌ API Error: ${result.error}`);
        
        cooldowns.set(`${guildId}-${sub}`, now);
        return message.reply({ embeds: [createEmbed("✅ Updated", `The bot's server ${sub} has been changed.`, colors.success)] });
      }

      if (sub === "bio") {
        const text = args.slice(1).join(" ");
        if (!text) return message.reply("❌ Please provide the bio text.");
        if (text.length > 190) return message.reply("❌ Bio cannot exceed 190 characters.");

        const result = await processBranding({ bio: text });
        if (result.error) return message.reply(`❌ API Error: ${result.error}`);
        
        cooldowns.set(`${guildId}-${sub}`, now);
        return message.reply({ embeds: [createEmbed("✅ Updated", "The bot's server bio has been updated.", colors.success)] });
      }

      if (sub === "reset") {
        const option = args[1]?.toLowerCase();
        let payload = {};
        let desc = "";

        if (option === "avatar") { payload = { avatar: null }; desc = "Avatar reset."; }
        else if (option === "banner") { payload = { banner: null }; desc = "Banner reset."; }
        else if (option === "bio") { payload = { bio: null }; desc = "Bio reset."; }
        else if (option === "all") { payload = { nick: null, avatar: null, banner: null, bio: null }; desc = "All settings reset."; }
        else return message.reply("❌ Use: `reset <avatar|banner|bio|all>`");

        const result = await processBranding(payload);
        if (result.error) return message.reply(`❌ API Error: ${result.error}`);
        
        cooldowns.set(`${guildId}-${sub}`, now);
        return message.reply({ embeds: [createEmbed("✅ Reset", desc, colors.success)] });
      }

    } catch (e) {
      console.error(e);
      return message.reply("❌ An unexpected error occurred.");
    }
  }
};
