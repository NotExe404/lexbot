const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Borra una cantidad específica de mensajes')
        .addIntegerOption(option =>
            option
                .setName('cantidad')
                .setDescription('Número de mensajes a borrar (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Borrar solo mensajes de este usuario')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad');
        const usuario = interaction.options.getUser('usuario');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return await interaction.reply({
                content: '❌ No tienes permisos para gestionar mensajes.',
                ephemeral: true
            });
        }

        try {
            let messages;
            if (usuario) {
                const allMessages = await interaction.channel.messages.fetch({ limit: 100 });
                messages = allMessages.filter(msg => msg.author.id === usuario.id).first(cantidad);
            } else {
                messages = await interaction.channel.messages.fetch({ limit: cantidad });
            }

            await interaction.channel.bulkDelete(messages);

            const clearEmbed = new EmbedBuilder()
                .setTitle('🧹 Mensajes Borrados')
                .setDescription(`**Cantidad:** ${messages.size} mensajes\n**Canal:** ${interaction.channel}\n**Moderador:** ${interaction.user.tag}${usuario ? `\n**Usuario:** ${usuario.tag}` : ''}`)
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({ embeds: [clearEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Error al borrar mensajes. Los mensajes deben tener menos de 14 días.',
                ephemeral: true
            });
        }
    },
};
