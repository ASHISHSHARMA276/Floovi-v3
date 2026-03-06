const fs = require("fs");
const { REST, Routes } = require('discord.js');

module.exports = (client) => {
  const folders = ["music", "devs"];
  const commandsData = [];

  for (const folder of folders) {
    const files = fs
      .readdirSync(`./commands/${folder}`)
      .filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const command = require(`../commands/${folder}/${file}`);
      client.commands.set(command.name, command);
      if (command.data) {
        commandsData.push(command.data.toJSON());
      }
      console.log(`Loaded command: ${command.name}`);
    }
  }

  client.once("ready", async () => {
    const rest = new REST({ version: "10" }).setToken(
      client.token || process.env.TOKEN,
    );
    try {
      console.log("Started refreshing application (/) commands.");
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commandsData,
      });
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error("Error reloading application (/) commands:", error);
    }
  });
};
