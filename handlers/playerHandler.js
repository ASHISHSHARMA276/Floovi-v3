const { Kazagumo } = require("kazagumo");
const { Connectors } = require("shoukaku");
const nodes = require("../config/lavalink");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createEmbed } = require("../utils/embedHandler");

module.exports = (client) => {

  // ============================
  // Create Kazagumo Manager
  // ============================
  client.manager = new Kazagumo(
    {
      defaultSearchEngine: "youtube",
      send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      }
    },
    new Connectors.DiscordJS(client),
    nodes.map(node => ({
      name: node.name || node.host,
      url: `${node.host}:${node.port}`, // ✅ Correct format
      auth: node.password,
      secure: node.secure,              // ✅ Let Shoukaku handle ws/wss
      reconnectTries: 10,
      reconnectInterval: 5000,
      resume: true,
      resumeKey: "musicbot",
      resumeTimeout: 60
    }))
  );

  // ============================
  // Lavalink Node Events
  // ============================
  client.manager.shoukaku.on("ready", (name) => {
    console.log(`🟢 Lavalink Node Ready: ${name}`);
  });

  client.manager.shoukaku.on("close", (name, code) => {
    console.log(`⚠️ Lavalink Node Closed: ${name} | Code: ${code}`);
  });

  client.manager.shoukaku.on("error", (name, error) => {
    console.error(`🔴 Shoukaku error for node [${name}]:`, error?.message || error);
  });

  client.manager.on("nodeConnect", node => {
    console.log(`🟢 Lavalink connected: ${node.options.name}`);
  });

  client.manager.on("nodeError", (node, error) => {
    console.log(`🔴 Lavalink error on node [${node.options.name}]: ${error.message}`);
  });

  // ============================
  // PLAYER START
  // ============================
  client.manager.on("playerStart", async (player, track) => {
    const channel = client.channels.cache.get(player.textId);
    if (!channel) return;

    const requesterName = track.requester?.username || "System";
    const requesterIcon = track.requester?.displayAvatarURL?.() || null;
    const isAutoplay = player.data.get("autoplay") || false;

    const embed = createEmbed(
      "Now Playing",
      `**[${track.title}](${track.uri})** — \`${Math.floor(track.length / 60000)}:${Math.floor((track.length / 1000) % 60).toString().padStart(2, "0")}\`\n> By **${track.author}**`,
      "#2B2D31",
      null,
      {
        name: `Requested By ${requesterName} | ${isAutoplay ? "Autoplay ON" : "Autoplay OFF"}`,
        iconURL: requesterIcon
      },
      track.thumbnail
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("previous").setEmoji("<:previous:1476155215811186770>").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("pause").setEmoji("<:play:1476139916114268293>").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("stop").setEmoji("<:stop:1476140138663903284>").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("skip").setEmoji("<:skip:1476140449470091396>").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("shuffle").setEmoji("<:shuffle:1476155499568304131>").setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("loop_track").setEmoji("<:TrackLoop:1476156492510924803>").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("loop_queue").setEmoji("<:loop_queue:1476156606113906876>").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("volume_down").setEmoji("<:volume_down:1476156745565999204>").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("volume_up").setEmoji("<:volume_up:1476156800469307485>").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("autoplay").setEmoji("♾️").setStyle(isAutoplay ? ButtonStyle.Success : ButtonStyle.Secondary)
    );

    const oldMessage = player.data.get("message");
    if (oldMessage) oldMessage.delete().catch(() => {});

    const message = await channel.send({ embeds: [embed], components: [row, row2] });
    player.data.set("message", message);
  });

  // ============================
  // PLAYER END (Autoplay)
  // ============================
  client.manager.on("playerEnd", async (player, track) => {
    const message = player.data.get("message");
    if (message) message.delete().catch(() => {});

    const guild = client.guilds.cache.get(player.guildId);
    const voiceChannel = guild?.channels.cache.get(player.voiceId);

    if (voiceChannel && !player.twentyFourSeven) {
      const humanUsers = voiceChannel.members.filter(m => !m.user.bot).size;
      if (humanUsers === 0) {
        player.destroy();
        return;
      }
    }

    if (player.data.get("autoplay") && player.queue.length === 0) {
      const lastTrack = track || player.queue.previous;
      if (!lastTrack) return;

      try {
        const result = await client.manager.search(
          `https://www.youtube.com/watch?v=${lastTrack.identifier}&list=RD${lastTrack.identifier}`,
          { requester: client.user }
        );

        if (result && result.tracks.length > 0) {
          const filtered = result.tracks.filter(t => t.identifier !== lastTrack.identifier);
          const nextTrack = filtered.length > 0
            ? filtered[Math.floor(Math.random() * Math.min(filtered.length, 10))]
            : result.tracks[0];

          if (nextTrack) {
            player.queue.add(nextTrack);
            if (!player.playing && !player.paused) player.play();
          }
        }
      } catch (err) {
        console.error("Autoplay error:", err);
      }
    }
  });

  // ============================
  // Prevent crash from Lavalink bad request
  // ============================
  process.on("unhandledRejection", (reason) => {
    if (reason?.message?.includes("Bad Request")) return;
    console.error("Unhandled Rejection:", reason);
  });
};