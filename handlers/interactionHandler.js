const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const config = require("../config/config");
        const isAdmin = config.Admin && config.Admin.includes(interaction.user.id);
        const adminCommands = ["noprefix", "addpremium", "removepremium", "premium", "blacklist", "coowner"];

        if (adminCommands.includes(interaction.commandName) && !isAdmin) {
            return interaction.reply({ content: "❌ You do not have permission to use this command.", ephemeral: true });
        }

        try {
            await command.execute(client, interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
        return;
    }

    if (!interaction.isButton()) return;

    const player = client.manager.players.get(interaction.guild.id);
    if (!player) return interaction.reply({ content: "❌ No player found for this server.", ephemeral: true });

    if (!interaction.member.voice.channel || interaction.member.voice.channel.id !== player.voiceId) {
      return interaction.reply({ content: "❌ You must be in the same voice channel as me!", ephemeral: true });
    }

    switch (interaction.customId) {
      case "previous":
        if (!player.queue.previous) return interaction.reply({ content: "❌ No previous track found.", ephemeral: true });
        player.queue.add(player.queue.previous);
        player.skip();
        await interaction.deferUpdate();
        break;

      case "pause":
        player.pause(!player.paused);
        await interaction.deferUpdate();
        break;

      case "stop":
        player.destroy();
        await interaction.deferUpdate();
        break;

      case "skip":
        player.skip();
        await interaction.deferUpdate();
        break;

      case "shuffle":
        player.queue.shuffle();
        await interaction.deferUpdate();
        break;

      case "loop_track":
        player.setLoop(player.loop === "track" ? "none" : "track");
        await interaction.deferUpdate();
        break;

      case "loop_queue":
        player.setLoop(player.loop === "queue" ? "none" : "queue");
        await interaction.deferUpdate();
        break;

      case "volume_down":
        let volDown = player.volume - 10;
        if (volDown < 0) volDown = 0;
        player.setVolume(volDown);
        await interaction.deferUpdate();
        break;

      case "volume_up":
        let volUp = player.volume + 10;
        if (volUp > 100) volUp = 100;
        player.setVolume(volUp);
        await interaction.deferUpdate();
        break;

      case "autoplay":
        const currentAutoplay = player.data.get("autoplay");
        player.data.set("autoplay", !currentAutoplay);
        
        // Update the message buttons
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
        const msg = interaction.message;
        if (msg && msg.components.length > 1) {
          const row2 = ActionRowBuilder.from(msg.components[1]);
          const autoplayButton = row2.components.find(c => c.data.custom_id === "autoplay");
          if (autoplayButton) {
            autoplayButton.setStyle(!currentAutoplay ? ButtonStyle.Success : ButtonStyle.Secondary);
          }
          await interaction.message.edit({ components: [msg.components[0], row2] });
        }
        await interaction.deferUpdate();
        break;
    }
  });
};
