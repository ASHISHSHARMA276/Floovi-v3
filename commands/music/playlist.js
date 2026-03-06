const Playlist = require("../../database/models/Playlist");
const { createEmbed, colors } = require("../../utils/embedHandler");
const emojis = require("../../utils/emojis");

module.exports = {
  name: "playlist",
  aliases: ["pl"],
  category: "music",
  description: "Manage your personal music playlists",

  async execute(client, message, args) {
    const sub = args[0]?.toLowerCase();
    const playlistName = args.slice(1).join(" ");

    if (!sub) {
      const helpEmbed = createEmbed(
        `${emojis.playlist} Playlist Management`,
        `**Available Commands:**\n` +
        `${emojis.dot} \`playlist create <name>\` - Create a new playlist\n` +
        `${emojis.dot} \`playlist delete <name>\` - Delete a playlist\n` +
        `${emojis.dot} \`playlist add <name>\` - Add current track to playlist\n` +
        `${emojis.dot} \`playlist remove <name> <index>\` - Remove a track\n` +
        `${emojis.dot} \`playlist list\` - List all your playlists\n` +
        `${emojis.dot} \`playlist show <name>\` - Show tracks in a playlist\n` +
        `${emojis.dot} \`playlist load <name>\` - Load and play a playlist`,
        colors.primary
      );
      return message.channel.send({ embeds: [helpEmbed] });
    }

    // List Playlists
    if (sub === "list") {
      const playlists = await Playlist.find({ userId: message.author.id });
      if (!playlists.length) return message.channel.send({ embeds: [createEmbed(null, `${emojis.error} You don't have any playlists yet.`, colors.error)] });

      const description = playlists.map((pl, i) => `\`${i + 1}.\` **${pl.name}** (${pl.tracks.length} tracks)`).join("\n");
      return message.channel.send({ embeds: [createEmbed(`${emojis.list} Your Playlists`, description, colors.primary)] });
    }

    if (!playlistName) return message.channel.send({ embeds: [createEmbed(null, `${emojis.error} Please provide a playlist name.`, colors.error)] });

    // Create Playlist
    if (sub === "create") {
      const existing = await Playlist.findOne({ userId: message.author.id, name: playlistName });
      if (existing) return message.channel.send({ embeds: [createEmbed(null, `${emojis.error} A playlist with that name already exists.`, colors.error)] });

      await Playlist.create({ userId: message.author.id, name: playlistName, tracks: [] });
      return message.channel.send({ embeds: [createEmbed(null, `${emojis.success} Created playlist **${playlistName}**.`, colors.success)] });
    }

    const playlist = await Playlist.findOne({ userId: message.author.id, name: playlistName });
    if (!playlist) return message.channel.send({ embeds: [createEmbed(null, `${emojis.error} Playlist **${playlistName}** not found.`, colors.error)] });

    // Delete Playlist
    if (sub === "delete") {
      await Playlist.deleteOne({ _id: playlist._id });
      return message.channel.send({ embeds: [createEmbed(null, `${emojis.success} Deleted playlist **${playlistName}**.`, colors.success)] });
    }

    // Add Track
    if (sub === "add") {
      const player = client.manager.players.get(message.guild.id);
      if (!player || !player.queue.current) return message.channel.send({ embeds: [createEmbed(null, `${emojis.error} No music is currently playing.`, colors.error)] });

      const track = player.queue.current;
      playlist.tracks.push({
        title: track.title,
        uri: track.uri,
        duration: track.duration,
        author: track.author
      });
      await playlist.save();
      return message.channel.send({ embeds: [createEmbed(null, `${emojis.add} Added [${track.title}](${track.uri}) to **${playlistName}**.`, colors.success)] });
    }

    // Show Playlist
    if (sub === "show") {
      if (!playlist.tracks.length) return message.channel.send({ embeds: [createEmbed(`${emojis.playlist} ${playlist.name}`, "This playlist is empty.", colors.primary)] });
      
      const tracks = playlist.tracks.slice(0, 10).map((t, i) => `\`${i + 1}.\` [${t.title}](${t.uri})`).join("\n");
      const description = playlist.tracks.length > 10 ? `${tracks}\n*...and ${playlist.tracks.length - 10} more tracks*` : tracks;
      
      return message.channel.send({ embeds: [createEmbed(`${emojis.playlist} ${playlist.name}`, description, colors.primary)] });
    }

    // Load Playlist
    if (sub === "load") {
      const { channel } = message.member.voice;
      if (!channel) return message.channel.send({ embeds: [createEmbed(null, `${emojis.error} You must be in a voice channel.`, colors.error)] });

      let player = client.manager.players.get(message.guild.id);
      if (!player) {
        player = client.manager.create({
          guild: message.guild.id,
          voiceChannel: channel.id,
          textChannel: message.channel.id,
          selfDeafen: true,
        });
      }

      if (player.state !== "CONNECTED") await player.connect();

      for (const trackData of playlist.tracks) {
        const res = await client.manager.search(trackData.uri, message.author);
        if (res.loadType !== "LOAD_FAILED" && res.loadType !== "NO_MATCHES") {
          player.queue.add(res.tracks[0]);
        }
      }

      if (!player.playing && !player.paused && player.queue.totalSize) player.play();
      
      return message.channel.send({ embeds: [createEmbed(null, `${emojis.load} Loaded **${playlist.tracks.length}** tracks from **${playlistName}**.`, colors.success)] });
    }

    // Remove Track
    if (sub === "remove") {
      const index = parseInt(args[2]) - 1;
      if (isNaN(index) || index < 0 || index >= playlist.tracks.length) {
        return message.channel.send({ embeds: [createEmbed(null, `${emojis.error} Please provide a valid track index to remove.`, colors.error)] });
      }

      const removed = playlist.tracks.splice(index, 1);
      await playlist.save();
      return message.channel.send({ embeds: [createEmbed(null, `${emojis.remove} Removed **${removed[0].title}** from **${playlistName}**.`, colors.success)] });
    }
  }
};
