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

    app.listen(3000, () => {
        console.log(`🌍 Port 3000 opened.`);
    }).on("error", (error) =>
        console.error(`❌ ERROR opening port 3000.`, error));

    app.get("/", (req, res) => {
        res.send(`The server is awake.`);
    });


    require("./voiceTrigger.js")(client);
    console.log(`✅ VoiceLogger operative!`);
});

client.login(process.env.TOKEN);