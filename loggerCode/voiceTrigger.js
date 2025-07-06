const { PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {
    client.on("voiceStateUpdate", async (oldState, newState) => {
        const guild = newState.guild; //Both states the same
        const channel = newState.channel || oldState.channel;

        if (oldState.channel && !newState.channel) {
            console.log(`${oldState.member.user.tag} se ha desconectado del canal de voz ${oldState.channel.name}`);
        } else if (newState.channel && oldState.channel?.id !== newState.channel.id) {
            const lowRole = guild.roles.cache
                .filter((role) => {
                    if (role.id === guild.id || // everyone
                        role.tags?.premiumSubscriberRole || // server boost
                        role.tags?.botId) // bot role
                        return false;

                    const permissionOverwrites = channel.permissionOverwrites.cache.get(role.id);
                    if (permissionOverwrites) 
                        return permissionOverwrites.allow.has(PermissionFlagsBits.Connect);
                })
                .sort((a, b) =>
                    a.position - b.position)
                .first() || guild.roles.everyone;

            const content = `${lowRole} ${newState.member.user.tag} se ha conectado al canal de voz ${channel.name}`;
            channel.send({ content });
            console.log(content);
        }
    });
}
