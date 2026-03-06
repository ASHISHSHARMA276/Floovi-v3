const { createEmbed, colors } = require("../../utils/embedHandler");
const User = require("../../database/models/User");
const config = require("../../config/config");

module.exports = {
    name: "profile",
    aliases: ["pr", "p", "userinfo"],
    category: "music",
    description: "Display your profile and status badges",

    async execute(client, message, args) {
        const target =
            message.mentions.users.first() ||
            (args[0] &&
                (await client.users.fetch(args[0]).catch(() => null))) ||
            message.author;

        let userData = await User.findOne({ userId: target.id });

        const badges = [];

        // Owner Check
        if (config.owners.includes(target.id)) {
            badges.push("<:owner:1476150785837367296> **Bot Owner**");
        }

        // Developer Check
        // Assuming developers are the same as owners or checked similarly
        if (config.owners.includes(target.id)) {
            badges.push(
                "<:xieron_developer:1476136808549974016> **Bot Developer**",
            );
        }

        // Admin Check
        if (config.Admin && config.Admin.includes(target.id)) {
            badges.push("<:Admin:1476150619680149627> **Bot Admin**");
        }

        // Database specific checks
        if (userData) {
            if (userData.isPremium) {
                badges.push("<:premium:1476139332707549184> **Premium User**");
            }
            if (userData.noPrefix) {
                badges.push("⚡ **No-Prefix User**");
            }
        }

        // Default badge
        if (badges.length === 0) {
            badges.push("<:star:1476141482330165268> **Simple User**");
        }

        const embed = createEmbed(
            ` Profile: ${target.username}`,
            null,
            colors.primary,
            { text: `ID: ${target.id}`, iconURL: target.displayAvatarURL() },
            null,
            target.displayAvatarURL(),
            [
                {
                    name: "<:flowers:1476151763898990704> Status Badges",
                    value: badges.join("\n"),
                    inline: false,
                },
                {
                    name: "<:discord:1476151630129790990> Joined Discord",
                    value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`,
                    inline: true,
                },
            ],
        );

        message.channel.send({ embeds: [embed] });
    },
};
