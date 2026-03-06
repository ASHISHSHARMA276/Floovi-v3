const { createEmbed, colors } = require("../../utils/embedHandler");
const emojis = require("../../utils/emojis");
const config = require("../../config/config");

module.exports = {
  name: "reload",
  category: "devs",
  description: "Reloads all bot commands",
  async execute(client, message, args) {
    const isOwner = config.owners.includes(message.author.id);
    const isCoOwner = config.Admin.includes(message.author.id);

    if (!isOwner && !isCoOwner) return;

    try {
      // Clear cache for all commands
      client.commands.forEach((cmd) => {
        const category = cmd.category || "music";
        try {
          const path = require.resolve(`../${category}/${cmd.name}.js`);
          delete require.cache[path];
        } catch (e) {
          // If category-based resolve fails, try relative to current file
          try {
            const path = require.resolve(`./${cmd.name}.js`);
            delete require.cache[path];
          } catch (e2) {}
        }
      });
      
      client.commands.clear();
      require("../../handlers/commandLoader")(client);

      const embed = createEmbed(
        `${emojis.success} Commands Reloaded`,
        `Successfully reloaded **${client.commands.size}** commands.`,
        colors.success
      );
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return message.channel.send({
        embeds: [createEmbed(null, `${emojis.error} Error reloading commands: \`${error.message}\``, colors.error)]
      });
    }
  },
};
