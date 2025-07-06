const { ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {
    client.on("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.channel && !newState.channel) {
            console.log(`${oldState.member.user.tag} se ha desconectado del canal de voz ${oldState.channel.name}`);
        } else if (newState.channel && oldState.channel?.id !== newState.channel.id) {
            newState.channel.send({ content: `${null} test`});
            console.log(`${newState.member.user.tag} se ha conectado al canal de voz ${newState.channel.name}`);
        }
    });
}
