require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");

const config = require("./config/config");

// ✅ Updated webhook imports
const {
  logGuildJoin,
  logGuildLeave,
  logError
} = require("./utils/webhook");

// ============================
// MongoDB Connection
// ============================
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/musicbot")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => logError(err, "MongoDB Connection"));

// ============================
// Create Client
// ============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
});

module.exports = { client };

client.commands = new Collection();

// ============================
// READY EVENT (v15 FIX)
// ============================
client.once("clientReady", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: "Use ?help", type: 0 }],
    status: "idle"
  });

  // ============================
  // 24/7 Reconnect System
  // ============================
  try {
    const Guild = require("./database/models/Guild");
    const guilds = await Guild.find({ twentyFourSeven: true });

    client.manager.on("nodeConnect", async (node) => {
      console.log(`[Lavalink] Node ${node.options.name} connected.`);

      // Add a small delay to ensure the session is fully established on the node
      setTimeout(async () => {
        for (const guildData of guilds) {
          const guild = client.guilds.cache.get(guildData.guildId);
          if (!guild || !guildData.voiceChannelId) continue;
          if (client.manager.players.has(guild.id)) continue;

          const channel = guild.channels.cache.get(guildData.voiceChannelId);
          if (!channel) continue;

          try {
            const player = await client.manager.createPlayer({
              guildId: guild.id,
              voiceId: channel.id,
              textId:
                guildData.textId ||
                guild.channels.cache.find(c => c.type === 0)?.id,
              deaf: true,
              shardId: guild.shardId
            });

            player.twentyFourSeven = true;
            player.data.set("autoplay", true);

            console.log(`[24/7] Reconnected to ${channel.name} in ${guild.name}`);
          } catch (err) {
            // Suppress "Bad Request" errors during initial sync as they often resolve on their own
            if (err.message && err.message.includes("Bad Request")) return;
            logError(err, `24/7 Reconnect - ${guild.name}`);
          }
        }
      }, 2000);
    });

  } catch (err) {
    logError(err, "Ready Event");
  }
});

// ============================
// Guild Join / Leave Logs
// ============================
client.on("guildCreate", guild => logGuildJoin(guild));
client.on("guildDelete", guild => logGuildLeave(guild));

// ============================
// Client Errors
// ============================
client.on("error", error => logError(error, "Discord Client"));
client.on("warn", warn => console.warn("⚠️", warn));

client.on("shardError", error => logError(error, "Shard Error"));

// ============================
// Global Crash Protection
// ============================
process.on("unhandledRejection", reason => {
  logError(reason, "Unhandled Rejection");
});

process.on("uncaughtException", error => {
  logError(error, "Uncaught Exception");
});

// ============================
// Load Handlers
// ============================
require("./handlers/commandLoader")(client);
require("./handlers/messageHandler")(client);
require("./handlers/playerHandler")(client);
require("./handlers/interactionHandler")(client);

// ============================
// Load Events
// ============================
const eventFiles = fs
  .readdirSync("./events")
  .filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  require(`./events/${file}`)(client);
}

// ============================
// Login
// ============================
client.login(config.token || process.env.TOKEN)
  .catch(err => {
    console.error("❌ Failed to login:");
    console.error(err);
    logError(err, "Login Failure");
  });