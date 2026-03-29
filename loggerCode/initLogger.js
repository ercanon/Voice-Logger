const {
    Client,
    GatewayIntentBits
} = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]});
const express = require("express");

/*>--------------- { Bot Initialization } ---------------<*/
client.once("ready", () => {
    const app = express();
    app.use(express.json());

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(`🌍 ¡Horacio ahora atrapa datos! Horacio atento en el puerto ${port}.`);
    }).on("error", (error) =>
        console.error(`❌ Error atrapando datos.`, error));

    app.get("/", (req, res) => {
        res.send(`The server is awake.`);
    });


    require("./voiceTrigger.js")(client);
    console.log(`✅ VoiceLogger operative!`);
});

client.login(process.env.TOKEN);
