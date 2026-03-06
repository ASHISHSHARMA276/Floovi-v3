const { createEmbed, colors } = require("../../utils/embedHandler");

module.exports = {
  name: "join",
  aliases: ["j"],
  category: "music",
  description: "Join the voice channel",

  async execute(client, message) {
    const { channel } = message.member.voice;
    const botChannel = message.guild.members.me.voice.channel;

    if (!channel)
      return message.channel.send({
        embeds: [
          createEmbed(null, "❌ You need to be in a voice channel.", colors.error)
        ]
      });

    if (botChannel && channel.id !== botChannel.id) {
      return message.channel.send({
        embeds: [
          createEmbed(
            null,
            `❌ You must be in the same voice channel as me (<#${botChannel.id}>) to use this command.`,
            colors.error
          )
        ]
      });
    }

    // 🔥 Lavalink Ready Check
    if (!client.manager.shoukaku.nodes.size) {
      return message.channel.send({
        embeds: [
          createEmbed(null, "⏳ Lavalink is not ready yet. Try again in 2 seconds.", colors.error)
        ]
      });
    }

    try {
      // 🔥 Prevent duplicate players
      let player = client.manager.players.get(message.guild.id);

      if (!player) {
        player = await client.manager.createPlayer({
          guildId: message.guild.id,
          voiceId: channel.id,
          textId: message.channel.id,
          shardId: message.guild.shardId, // ✅ VERY IMPORTANT
          deaf: true
        });
      }

      const embed = createEmbed(
        "☑️ Channel joined!",
        `> Successfully joined vc \`🔊 🎵 • ${channel.name}\``,
        "#2B2D31"
      );

      message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Join command error:", err);

      message.channel.send({
        embeds: [
          createEmbed(null, "❌ Failed to join voice channel.", colors.error)
        ]
      });
    }
  }
};