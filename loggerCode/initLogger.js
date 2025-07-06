const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes,
    MessageFlags
} = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

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

(async () => {
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body });
        console.log("📤 Applying command.");
    }
    catch (error) {
        console.error("❌ ERROR applying command.", error);
    }
})();

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

///*>--------------- { Guilds } ---------------<*/
//const VoiceHoracio = require("./voiceHoracio.js");
//client.on("guildCreate", (guild) =>
//    new VoiceHoracio(guild));

///*>--------------- { Bot Initialization } ---------------<*/
//client.once("ready", () => {
//    client.guilds.cache.forEach((guild) =>
//        new VoiceHoracio(guild, app));
//    console.log(`✅ Horacio está, ¡sí sí! ¡Conectado, todo listo!`);
//});

client.login(process.env.TOKEN);
