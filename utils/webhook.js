const { EmbedBuilder, WebhookClient } = require("discord.js");

// =============================
// Webhook URLs (Set in .env)
// =============================
// GUILD_JOIN_WEBHOOK=
// GUILD_LEAVE_WEBHOOK=
// ERROR_WEBHOOK=

const joinWebhook = process.env.GUILD_JOIN_WEBHOOK
  ? new WebhookClient({ url: process.env.GUILD_JOIN_WEBHOOK })
  : null;

const leaveWebhook = process.env.GUILD_LEAVE_WEBHOOK
  ? new WebhookClient({ url: process.env.GUILD_LEAVE_WEBHOOK })
  : null;

const errorWebhook = process.env.ERROR_WEBHOOK
  ? new WebhookClient({ url: process.env.ERROR_WEBHOOK })
  : null;

// =============================
// Base Sender
// =============================
const sendWebhook = async (webhook, embed) => {
  if (!webhook) return;

  try {
    await webhook.send({
      username: "Floovi Logs",
      avatarURL: "https://cdn.discordapp.com/embed/avatars/0.png",
      embeds: [embed],
    });
  } catch (err) {
    console.error("Webhook send failed:", err);
  }
};

// =============================
// Guild Join Log
// =============================
const logGuildJoin = async (guild) => {
  if (!joinWebhook) return;

  const owner = await guild.fetchOwner().catch(() => null);

  const embed = new EmbedBuilder()
    .setTitle("📥 Joined New Server")
    .addFields(
      { name: "Server Name", value: `**${guild.name}**`, inline: true },
      { name: "Server ID", value: `\`${guild.id}\``, inline: true },
      { name: "Members", value: `**${guild.memberCount}**`, inline: true },
      {
        name: "Owner",
        value: owner
          ? `**${owner.user.tag}** (\`${owner.id}\`)`
          : "Unknown",
        inline: true,
      }
    )
    .setColor("#43B581")
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setTimestamp();

  await sendWebhook(joinWebhook, embed);
};

// =============================
// Guild Leave Log
// =============================
const logGuildLeave = async (guild) => {
  if (!leaveWebhook) return;

  const embed = new EmbedBuilder()
    .setTitle("📤 Left Server")
    .addFields(
      { name: "Server Name", value: `**${guild.name}**`, inline: true },
      { name: "Server ID", value: `\`${guild.id}\``, inline: true },
      { name: "Members", value: `**${guild.memberCount}**`, inline: true }
    )
    .setColor("#F04747")
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setTimestamp();

  await sendWebhook(leaveWebhook, embed);
};

// =============================
// Error Logger
// =============================
const logError = async (error, context = "Unknown") => {
  console.error(`[ERROR - ${context}]`, error);

  if (!errorWebhook) return;

  const embed = new EmbedBuilder()
    .setTitle("🚨 Bot Error Detected")
    .setDescription(
      `**Context:** ${context}\n\n\`\`\`\n${error.stack || error}\n\`\`\``
    )
    .setColor("#ED4245")
    .setTimestamp();

  await sendWebhook(errorWebhook, embed);
};

module.exports = {
  logGuildJoin,
  logGuildLeave,
  logError,
};