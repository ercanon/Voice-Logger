const { PermissionFlagsBits } = require("discord.js");

module.exports = (client) => {
    client.on("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.channel?.id === newState.channel?.id)
            return;

        const guild = newState.guild; //Both states the same

        const msgFound = await (oldState.channel || newState.channel).messages.cache.find((msg) =>
            msg.author.id === client.user.id &&
            msg.content.includes(newState.member.user.tag));

        if (msgFound) {
            console.log(`Deleting msg: ${msgFound}`);
            msgFound
                .delete()
                .catch(console.error);
        }
        else
            console.log(`Message not found in the cache`);

        if (oldState.channel && !newState.channel)
            console.log(`${newState.member.user.tag} se ha desconectado del canal de voz ${oldState.channel.name}`);
        else if (newState.channel) {
            const { channel } = newState
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
