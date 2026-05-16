const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const express = require("express");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});


/*>--------------- { Commands } ---------------<*/
const clearLogsCmd = require("./commands/clearLogs.js");
(async () => {
    try {
        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [clearLogsCmd.data.toJSON()] });
        console.log("📤 Registrando command.");
    }
    catch (error) {
        console.error("❌ Hubo un error registrando el command.", error);
    }
})();

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand())
        return;
    console.log(`¡Ejecutando ${interaction.commandName}!`);

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
                content: "❌ No se pudo ejecutar el comando.",
                flags: [MessageFlags.Ephemeral],
            });
    }
});

// --- Función para simular el comando en todos los canales de voz ---
async function clearAllVoiceChannels() {
    try {
        // Obtenemos todos los servidores en los que está el bot
        const guilds = await client.guilds.fetch();

        for (const [_, oGuild] of guilds) {
            const guild = await oGuild.fetch().catch(() => null);
            if (!guild) continue;

            // Filtramos únicamente los canales de VOZ del servidor
            const channels = await guild.channels.fetch();
            const voiceChannels = [...channels.values()].filter(ch => ch.type === ChannelType.GuildVoice);

            for (const voiceChannel of voiceChannels) {
                console.log(`⏳ Simulando comando de limpieza en el canal de voz: ${voiceChannel.name}`);

                // 🛠️ CREAMOS UN OBJETO INTERACTION FALSO (MOCK)
                // Este objeto simula lo que el comando espera recibir de Discord
                const fakeInteraction = {
                    client: client,
                    guild: guild,
                    channel: voiceChannel,
                    // Mock de las opciones del comando (amount: null para que borre todo)
                    options: {
                        getInteger: (name) => null
                    },
                    // Mocks de las respuestas para que el comando no falle al intentar responder
                    deferReply: async () => console.log(`   [${voiceChannel.name}] Deferring...`),
                    editReply: async (obj) => console.log(`   [${voiceChannel.name}] Resultado: ${obj.content}`)
                };

                // 🔥 Ejecutamos el archivo del comando directamente pasándole nuestra interacción falsa
                await clearVoiceLogsCmd.execute(fakeInteraction).catch((err) => {
                    console.error(`❌ Error al limpiar canal de voz ${voiceChannel.name}:`, err.message);
                });
            }
        }
        console.log("✅ Fin de la limpieza automática de canales de voz.");
    } catch (error) {
        console.error("❌ Error en el proceso de limpieza del ready:", error);
    }
}

/*>--------------- { Bot Initialization } ---------------<*/
client.once("ready", async () => {
    const app = express();
    app.use(express.json());
    const port = process.env.PORT || 4000;
    
    app.listen(port, () => {
        console.log(`🌍 Connected to port ${port}.`);
    }).on("error", (error) =>
        console.error(`❌ Error:`, error));

    app.get("/", (req, res) => {
        res.send(`The server is awake.`);
    });

    require("./voiceTrigger.js")(client);
    console.log(`✅ VoiceLogger operative!`);

    console.log("🧹 Iniciando limpieza automática de logs de voz...");
    await clearAllVoiceChannels();
});

client.login(process.env.TOKEN);