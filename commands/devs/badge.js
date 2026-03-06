const isDev = require("../../utils/devCheck");
const User = require("../../database/models/User");
const { createEmbed, colors } = require("../../utils/embedHandler");
const config = require("../../config/config");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "badge",
  category: "devs",
  description: "Manage user badges (owner/dev/admin/premium/noprefix)",

  async execute(client, message, args) {
    if (!isDev(message.author.id)) return;

    // Join args to handle multi-word types or messy input
    const input = args.join(" ").toLowerCase();
    
    // Determine action
    let action = null;
    if (input.startsWith("add")) action = "add";
    else if (input.startsWith("remove")) action = "remove";

    if (!action) {
      return message.channel.send({ 
        embeds: [createEmbed(
          "❌ Invalid Usage",
          `**Usage:** \`badge <add|remove> <type> <user>\`\n\n**Types:** \`owner\`, \`dev\`, \`admin\`, \`premium\`, \`noprefix\`\n\n**Examples:**\n\`badge add dev @user\`\n\`badge add premium @user\``,
          colors.error
        )] 
      });
    }

    // Identify user
    const user = message.mentions.users.first() || 
                 (args.find(a => /^\d{17,19}$/.test(a)) && await client.users.fetch(args.find(a => /^\d{17,19}$/.test(a))).catch(() => null));

    if (!user) {
      return message.channel.send({ embeds: [createEmbed(null, "❌ Please mention a user or provide a valid ID.", colors.error)] });
    }

    // Determine badge type by looking for keywords in the args
    let type = null;
    const searchString = args.slice(1).join(" ").toLowerCase();
    
    if (searchString.includes("owner")) type = "owner";
    else if (searchString.includes("dev")) type = "dev";
    else if (searchString.includes("admin")) type = "admin";
    else if (searchString.includes("premium")) type = "premium";
    else if (searchString.includes("noprefix")) type = "noprefix";

    if (!type) {
      return message.channel.send({ 
        embeds: [createEmbed(
          "❌ Invalid Badge Type",
          "Please specify a valid badge: `owner`, `dev`, `admin`, `premium`, or `noprefix`.",
          colors.error
        )] 
      });
    }

    const configPath = path.join(__dirname, "../../config/config.js");
    let userData = await User.findOne({ userId: user.id });
    if (!userData) userData = await User.create({ userId: user.id });

    // Handle Config-based badges (Owner/Dev/Admin)
    if (["owner", "dev", "admin"].includes(type)) {
      if (!config.owners.includes(message.author.id)) {
        return message.channel.send({ embeds: [createEmbed(null, "❌ Only the **Bot Owner** can manage administrative badges.", colors.error)] });
      }

      let key = type === "admin" ? "Admin" : "owners";
      if (!config[key]) config[key] = [];

      if (action === "add") {
        if (config[key].includes(user.id)) return message.channel.send("User already has this badge.");
        config[key].push(user.id);
      } else {
        if (!config[key].includes(user.id)) return message.channel.send("User doesn't have this badge.");
        config[key] = config[key].filter(id => id !== user.id);
      }

      // Persist to config.js file
      const newConfigContent = `module.exports = ${JSON.stringify(config, null, 2)};`;
      fs.writeFileSync(configPath, newConfigContent);
    } 
    // Handle Database-based badges (Premium/NoPrefix)
    else if (["premium", "noprefix"].includes(type)) {
      if (action === "add") {
        if (type === "premium") {
          userData.isPremium = true;
          userData.premiumUntil = null;
        } else {
          userData.noPrefix = true;
          userData.noPrefixUntil = null;
        }
      } else {
        if (type === "premium") userData.isPremium = false;
        else userData.noPrefix = false;
      }
      await userData.save();
    }

    const isAdd = action === "add";
    return message.channel.send({ 
      embeds: [createEmbed(
        isAdd ? "✨ Badge Granted" : "🚫 Badge Revoked",
        `Successfully ${isAdd ? "granted" : "revoked"} the **${type.toUpperCase()}** badge ${isAdd ? "to" : "from"} **${user.tag}**.`,
        isAdd ? colors.success : colors.error,
        null,
        { name: "Executive Action", iconURL: message.author.displayAvatarURL() },
        user.displayAvatarURL()
      )] 
    });
  }
};
