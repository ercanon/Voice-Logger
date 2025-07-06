const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes,
    MessageFlags
} = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]});
const express = require("express");

/*>--------------- { Commands } ---------------<*/
client.commands = new Collection();
const commandFiles = require("fs")
    .readdirSync("./loggerCode/actions")
    .filter((file) => file.endsWith(".js"));

const body = [];
for (const file of commandFiles) {
    const cmd = require(`./actions/${file}`);
    client.commands.set(cmd.data.name, cmd);
    body.push(cmd.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

//(async () => {
//    try {
//        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body });
//        console.log("📤 Applying command.");
//    }
//    catch (error) {
//        console.error("❌ ERROR applying command.", error);
//    }
//})();

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand())
        return;
    console.log(`Using command ${interaction.commandName}!`);

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd)
        return;

    try {
        await cmd.execute(interaction);
    }
    catch (error) {
        console.error(error);
        if (!interaction.replied)
            await interaction.reply({
                content: "❌ ERROR using command",
                flags: [MessageFlags.Ephemeral],
            });
    }
});

/*>--------------- { Bot Initialization } ---------------<*/
client.once("ready", () => {
    const app = express();
    app.use(express.json());

    app.listen(3000, () => {
        console.log(`🌍 Port 3000 opened.`);
    }).on("error", (error) =>
        console.error(`❌ ERROR opening port 3000.`, error));

    require("./voiceTrigger.js")(client);
    console.log(`✅ VoiceLogger operative!`);
});

client.login(process.env.TOKEN);