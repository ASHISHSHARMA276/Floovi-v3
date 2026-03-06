const { EmbedBuilder } = require("discord.js");

module.exports = {
    /**
     * Create a professional embed
     * @param {string} title 
     * @param {string} description 
     * @param {string} color 
     * @param {object} footer 
     * @param {object} author 
     * @param {string} thumbnail 
     * @param {Array} fields 
     */
    createEmbed: (title, description, color = "#2F3136", footer = null, author = null, thumbnail = null, fields = []) => {
        const { client } = require("../index");
        const embed = new EmbedBuilder()
            .setColor(color);

        if (title) {
            // Zeon-style author: Title + Icon
            embed.setAuthor({ name: title, iconURL: client.user.displayAvatarURL() });
        }
        if (description) embed.setDescription(description);
        if (thumbnail) {
            embed.setThumbnail(thumbnail);
        }
        if (footer) {
            // Footer for play command/others
            embed.setFooter(footer);
        }
        if (author) {
            // Zeon-style footer: Requested By User | Autoplay Enabled
            embed.setFooter({ text: author.name, iconURL: author.iconURL });
        }
        if (fields.length > 0) embed.addFields(fields);

        return embed;
    },

    // Colors
    colors: {
        primary: "#5865F2",
        success: "#43B581",
        error: "#F04747",
        warning: "#FAA61A",
        invisible: "#2F3136"
    }
};
