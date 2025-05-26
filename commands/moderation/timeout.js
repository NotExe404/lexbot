const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Aplica timeout a un miembro')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario a silenciar')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('duracion')
                .setDescription('Duración en minutos')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('razon')
                .setDescription('Razón del timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const duration = interaction.options.getInteger('duracion');
        const reason = interaction.options.getString('razon') || 'No se especificó razón';

        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return await interaction.reply({
                content: '❌ No tienes permisos para aplicar timeouts.',
                ephemeral: true
            });
        }

        try {
            const member = await interaction.guild.members.fetch(target.id);
            const timeoutDuration = duration * 60 * 1000;
            
            await member.timeout(timeoutDuration, reason);
            
            const timeoutEmbed = new EmbedBuilder()
                .setTitle('⏰ Usuario en Timeout')
                .setDescription(`**Usuario:** ${target.tag}\n**Duración:** ${duration} minutos\n**Razón:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
                .setColor('#ffff00')
                .setTimestamp();

            await interaction.reply({ embeds: [timeoutEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `❌ Error al aplicar timeout a ${target.tag}. Verifica que el bot tenga permisos suficientes.`,
                ephemeral: true
            });
        }
    },
};
