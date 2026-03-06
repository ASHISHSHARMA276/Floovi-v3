module.exports = {
  name: "search",
  aliases: ["sr"],
  category: "music",
  description: "Search and select a song",

  async execute(client, message, args) {
    const voice = message.member.voice.channel;
    if (!voice) return message.channel.send("❌ Join a voice channel.");

    const query = args.join(" ");
    if (!query) return message.channel.send("❌ Provide a search term.");

    const res = await client.manager.search(query, message.author);
    if (!res.tracks.length) return message.channel.send("❌ No results found.");

    const tracks = res.tracks.slice(0, 5);

    let desc = tracks
      .map((t, i) => `**${i + 1}.** ${t.title}`)
      .join("\n");

    message.channel.send(
      `🎶 **Search Results**\n${desc}\n\nType a number (1-5)`
    );

    const filter = m =>
      m.author.id === message.author.id &&
      /^[1-5]$/.test(m.content);

    const collected = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 15000
    });

    if (!collected.size)
      return message.channel.send("❌ Search timed out.");

    const choice = Number(collected.first().content) - 1;

    let player = client.manager.players.get(message.guild.id);
    if (!player) {
      player = await client.manager.createPlayer({
        guildId: message.guild.id,
        voiceId: voice.id,
        textId: message.channel.id,
        deaf: true
      });
    }

    player.queue.add(tracks[choice]);
    if (!player.playing) player.play();

    message.channel.send(`🎵 Added: **${tracks[choice].title}**`);
  }
};
