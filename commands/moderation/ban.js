const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un miembro del servidor')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario a banear')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('razon')
                .setDescription('Razón del baneo')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se especificó razón';

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({
                content: '❌ No tienes permisos para banear miembros.',
                ephemeral: true
            });
        }

        try {
            await interaction.guild.bans.create(target, { reason });
            
            const banEmbed = new EmbedBuilder()
                .setTitle('🔨 Usuario Baneado')
                .setDescription(`**Usuario:** ${target.tag}\n**Razón:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
                .setColor('#ff0000')
                .setTimestamp();

            await interaction.reply({ embeds: [banEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `❌ Error al banear a ${target.tag}. Verifica que el bot tenga permisos suficientes.`,
                ephemeral: true
            });
        }
    },
};
