const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Establece el modo lento en el canal')
        .addIntegerOption(option =>
            option
                .setName('segundos')
                .setDescription('Segundos de cooldown (0-21600)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        const segundos = interaction.options.getInteger('segundos');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return await interaction.reply({
                content: '❌ No tienes permisos para gestionar canales.',
                ephemeral: true
            });
        }

        try {
            await interaction.channel.setRateLimitPerUser(segundos);

            const slowmodeEmbed = new EmbedBuilder()
                .setTitle('🐌 Modo Lento Configurado')
                .setDescription(`**Canal:** ${interaction.channel}\n**Cooldown:** ${segundos} segundos\n**Moderador:** ${interaction.user.tag}`)
                .setColor('#0099ff')
                .setTimestamp();

            await interaction.reply({ embeds: [slowmodeEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Error al configurar el modo lento.',
                ephemeral: true
            });
        }
    },
};
