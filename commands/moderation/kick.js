const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un miembro del servidor')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario a expulsar')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('razon')
                .setDescription('Razón de la expulsión')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se especificó razón';

        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return await interaction.reply({
                content: '❌ No tienes permisos para expulsar miembros.',
                ephemeral: true
            });
        }

        try {
            const member = await interaction.guild.members.fetch(target.id);
            await member.kick(reason);
            
            const kickEmbed = new EmbedBuilder()
                .setTitle('👢 Usuario Expulsado')
                .setDescription(`**Usuario:** ${target.tag}\n**Razón:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
                .setColor('#ff9900')
                .setTimestamp();

            await interaction.reply({ embeds: [kickEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `❌ Error al expulsar a ${target.tag}. Verifica que el bot tenga permisos suficientes.`,
                ephemeral: true
            });
        }
    },
};
