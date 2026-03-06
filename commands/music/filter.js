const emojis = require("../../utils/emojis");
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const filters = require("../../config/filters");

module.exports = {
  name: "filter",
  aliases: ["fx"],
  category: "music",
  description: "Apply professional music filters and equalizers",

  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    if (!player) {
      return message.channel.send({ 
        embeds: [new EmbedBuilder().setColor("#ff0000").setDescription("<:Cross:1476141249818923029> No music is currently playing.")] 
      });
    }

    const availableFilters = Object.keys(filters).filter(f => f !== "clear");
    
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("<:Music:1476138747677638759> Music Filters")
      .setDescription("Select a filter from the menu below to enhance your listening experience.")
      .addFields({ name: "Current Filter", value: `\`${player.filters?.name || "None"}\`` })
      .setFooter({ text: "Professional Audio Equalizers", iconURL: client.user.displayAvatarURL() });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("filter_select")
      .setPlaceholder("Choose an audio filter...")
      .addOptions([
        { label: "None / Clear", value: "off", description: "Reset all audio filters", emoji: "🗑️" },
        ...availableFilters.map(f => ({
          label: f.charAt(0).toUpperCase() + f.slice(1),
          value: f,
          description: `Apply the ${f} equalizer preset`,
          emoji: "🎚️"
        }))
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = (i) => i.customId === "filter_select" && i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

    collector.on("collect", async (i) => {
      const selected = i.values[0];
      
      if (selected === "off") {
        player.shoukaku.clearFilters();
        await i.update({ 
          embeds: [new EmbedBuilder().setColor("#5865F2").setDescription("☑️ All filters have been cleared.")], 
          components: [] 
        });
      } else {
        const filterData = filters[selected];
        player.shoukaku.setFilters(filterData);
        player.filters = { name: selected }; // Store for display
        
        await i.update({ 
          embeds: [new EmbedBuilder().setColor("#5865F2").setDescription(`☑️ Applied **${selected}** filter.`)], 
          components: [] 
        });
      }
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time" && collected.size === 0) {
        msg.edit({ components: [] }).catch(() => {});
      }
    });
  },
};
