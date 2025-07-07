const { PermissionFlagsBits } = require("discord.js");
const msgPattern = /^<@!?&?\d+> #\d+ Session: .+$/

module.exports = (client) => {
    client.on("voiceStateUpdate", async (oldState, newState) => {
        const guild = newState.guild; //Both states the same
        const channel = newState.channel || oldState.channel;

        if (oldState.channel && !newState.channel) {
            console.log(`${lowRole} ${newState.member.user.tag} se ha desconectado del canal de voz ${channel.name}`);

            let lastMessageID = undefined;
            for (let i = 0; i < 5; i++) {
                channel.messages
                    .fetch({
                        limit: 20,
                        before: lastMessageID
                    })
                    .then((msgFetched) => {
                        const msgFound = msgFetched
                            .find((msg) =>
                                msg.author.id === client.user.id &&
                                msg.content.includes(`${oldState.member.user.tag}`))

                        if (msgFound)
                            return msgFound.delete();

                        lastMessageID = messages.last().id;
                    })
                    .catch(console.error);
            }
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
