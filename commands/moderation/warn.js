const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advierte a un usuario')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario a advertir')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('razon')
                .setDescription('Razón de la advertencia')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return await interaction.reply({
                content: '❌ No tienes permisos para advertir usuarios.',
                ephemeral: true
            });
        }

        const warnEmbed = new EmbedBuilder()
            .setTitle('⚠️ Usuario Advertido')
            .setDescription(`**Usuario:** ${target.tag}\n**Razón:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
            .setColor('#ffff00')
            .setTimestamp();

        await interaction.reply({ embeds: [warnEmbed] });

        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle('⚠️ Has recibido una advertencia')
                .setDescription(`**Servidor:** ${interaction.guild.name}\n**Razón:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
                .setColor('#ffff00')
                .setTimestamp();

            await target.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log('No se pudo enviar DM al usuario');
        }
    },
};
