const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "disconnect",
  aliases: ["dc", "leave"],
  category: "music",
  description: "Disconnect from the voice channel",

  async execute(client, message) {
    const player = client.manager.players.get(message.guild.id);
    const botVoiceState = message.guild.members.me.voice;
    const channel = botVoiceState.channel;
    const userChannel = message.member.voice.channel;

    if (!channel) {
      return message.channel.send({ embeds: [createEmbed(null, "❌ I am not in a voice channel.", colors.error)] });
    }

    if (!userChannel || userChannel.id !== channel.id) {
      return message.channel.send({ embeds: [createEmbed(null, `❌ You must be in the same voice channel as me (<#${channel.id}>) to use this command.`, colors.error)] });
    }

    if (player) {
      player.destroy();
    } else if (channel) {
      await botVoiceState.disconnect();
    }

    const embed = createEmbed(
      "👋 Channel left!",
      `> Successfully disconnected from \`🔊 🎵 • ${channel ? channel.name : "Unknown"}\``,
      "#2B2D31"
    );

    message.channel.send({ embeds: [embed] });
  }
};
