const {
    SlashCommandBuilder,
    MessageFlags,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear_logs") //Does not admit Caps
        .setDescription("Clear all logs from chat")
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("Number of recent logs to delete")
                .setRequired(false)
        ),
async execute(interaction) {
        const { channel, guild } = interaction;
        if (!channel || channel.type === ChannelType.DM) return;

        await interaction.deferReply({ ephemeral: true });

        const botPermissions = channel.permissionsFor(guild.members.me);
        if (!botPermissions || !botPermissions.has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory])) {
            return interaction.editReply({
                content: "❌ Necesito los permisos `Gestionar Mensajes` y `Leer el historial de mensajes`.",
            });
        }

        const amount = interaction.options.getInteger("amount");
        try {
            const fetchedMessages = await channel.messages.fetch({ limit: 50 });

            const targetText = "se ha conectado al canal de voz";
            let messagesToDelete = fetchedMessages.filter(msg => 
                msg.author.bot && msg.content.toLowerCase().includes(targetText.toLowerCase())
            );

            if (messagesToDelete.size === 0) {
                return interaction.editReply({
                    content: `⚠️ No se encontraron mensajes del bot que contengan "${targetText}".`,
                });
            }

            if (amount)
                messagesToDelete = messagesToDelete.first(amount);

            const deleted = await channel.bulkDelete(messagesToDelete, true);

            await interaction.editReply({
                content: `🗑️ Se han eliminado **${deleted.size}** mensajes de aviso de conexión de voz.`,
            });

        } catch (error) {
            console.error("Error al limpiar registros de voz:", error);
            await interaction.editReply({
                content: `❌ Ocurrió un error al intentar borrar los mensajes.`,
            });
        }
    }
};