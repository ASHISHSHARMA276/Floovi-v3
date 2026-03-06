const config = require("../../config/config");
const { createEmbed, colors } = require("../../utils/embedHandler");
const emojis = require("../../utils/emojis");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "coowner",
  aliases: ["co"],
  category: "devs",
  description: "Add or remove a co-owner who can manage noprefix and premium",

  async execute(client, message, args) {
    // Only owners from the original config can use this
    const owners = ["1460294357692452925", "1451527544539971656"];
    if (!owners.includes(message.author.id)) return;

    const action = args[0]?.toLowerCase();
    const user = message.mentions.users.first() || (args[1] && await client.users.fetch(args[1]).catch(() => null));

    if (!action || !user) {
      return message.channel.send({
        embeds: [createEmbed(
          `${emojis.devs} Co-Owner Management`,
          `**Usage:** \`coowner <add|remove> <user>\`\n\n**Examples:**\n\`coowner add @user\`\n\`coowner remove @user\``,
          colors.primary
        )]
      });
    }

    const configPath = path.join(__dirname, "../../config/config.js");
    // Re-require to get fresh data
    delete require.cache[require.resolve("../../config/config")];
    let currentConfig = require("../../config/config");

    if (action === "add") {
      if (currentConfig.Admin.includes(user.id)) {
        return message.channel.send({ embeds: [createEmbed(null, `${emojis.error} **${user.username}** is already a co-owner.`, colors.error)] });
      }

      currentConfig.Admin.push(user.id);
      saveConfig(configPath, currentConfig);

      return message.channel.send({
        embeds: [createEmbed(
          `${emojis.success} Co-Owner Added`,
          `Successfully added **${user.username}** as a co-owner. They now have access to \`noprefix\` and \`premium\` commands.`,
          colors.success,
          null,
          null,
          user.displayAvatarURL()
        )]
      });
    }

    if (action === "remove") {
      if (!currentConfig.Admin.includes(user.id)) {
        return message.channel.send({ embeds: [createEmbed(null, `${emojis.error} **${user.username}** is not a co-owner.`, colors.error)] });
      }

      currentConfig.Admin = currentConfig.Admin.filter(id => id !== user.id);
      saveConfig(configPath, currentConfig);

      return message.channel.send({
        embeds: [createEmbed(
          `${emojis.success} Co-Owner Removed`,
          `Successfully removed **${user.username}** from co-owners.`,
          colors.success,
          null,
          null,
          user.displayAvatarURL()
        )]
      });
    }
  }
};

function saveConfig(configPath, config) {
  const content = `module.exports = ${JSON.stringify(config, null, 2)};`;
  fs.writeFileSync(configPath, content);
}
