const Track = require("../../database/models/Track");

module.exports = {
  name: "track",
  aliases: ["like", "dislike", "save"],
  category: "music",
  description: "Like, dislike or save a track",

  async execute(client, message, args) {
    const player = client.manager.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.channel.send("❌ No music playing.");

    const track = player.queue.current;
    const action = message.content.split(" ")[0].slice(1); // Extract command name without prefix

    if (action === "like" || action === "save") {
        await Track.create({ userId: message.author.id, track: track.title, action: "like" });
        return message.channel.send(`❤️ Track **${track.title}** has been added to your favorites.`);
    }

    if (action === "dislike") {
        await Track.create({ userId: message.author.id, track: track.title, action: "dislike" });
        return message.channel.send(`👎 Track **${track.title}** has been blacklisted for you.`);
    }

    message.channel.send("Use `!like`, `!dislike` or `!save` while a track is playing.");
  }
};
