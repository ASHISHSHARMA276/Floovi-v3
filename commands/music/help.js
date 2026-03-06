const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");
const { colors } = require("../../utils/embedHandler");
const config = require("../../config/config");
const emojis = require("../../utils/emojis");

module.exports = {
  name: "help",
  aliases: ["commands", "h"],
  category: "music",
  description: "Display a professional help menu with all available commands",

  async execute(client, message) {
    const categories = {};
    client.commands.forEach(cmd => {
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd.name);
    });

    const getPrefix = require("../../utils/getPrefix");
    const prefix = await getPrefix(message.guild.id, message.author.id);

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setAuthor({ 
        name: `Hey there cutie, ${message.author.username} . ?! I pulled together everything I can do to help you out.`, 
        iconURL: "https://cdn.discordapp.com/emojis/1476141482330165268.png" 
      })
      .setDescription(`${emojis.dot} **Need a command? My prefix is** \`${prefix}\`\n\n| Choose a category below and i'll show you what's inside.`)
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const options = Object.keys(categories).map(cat => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: cat,
      emoji: emojis[cat] || emojis.info,
      description: `View ${cat} commands`
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help_menu")
      .setPlaceholder("Select a category to view commands")
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const helpMessage = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = helpMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;

      const category = interaction.values[0];
      const commandList = categories[category].map(cmd => `\`${cmd}\``).join(", ");
      
      const categoryEmbed = new EmbedBuilder()
        .setColor(colors.primary)
        .setTitle(`${emojis[category] || emojis.info} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
        .setDescription(commandList || "No commands available.")
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      await interaction.update({ embeds: [categoryEmbed] });
    });

    collector.on("end", () => {
      helpMessage.edit({ components: [] }).catch(() => {});
    });
  }
};
