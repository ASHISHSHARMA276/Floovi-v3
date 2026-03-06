module.exports = {
  name: "volume",
  aliases: ["vol"],
  category: "music",
  description: "Change or view volume",

  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    if (!player)
      return message.channel.send("❌ No music playing.");

    if (!args[0])
      return message.channel.send(`🔊 Current volume: **${player.volume}%**`);

    const volume = Number(args[0]);
    if (isNaN(volume) || volume < 1 || volume > 200)
      return message.channel.send("❌ Volume must be between 1 and 200.");

    player.setVolume(volume);
    message.channel.send(`✅ Volume set to **${volume}%**`);
  }
};
