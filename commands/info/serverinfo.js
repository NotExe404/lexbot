const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información del servidor'),
    
    async execute(interaction) {
        const guild = interaction.guild;

        const serverEmbed = new EmbedBuilder()
            .setTitle(`📊 Información de ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: guild.id, inline: true },
                { name: 'Propietario', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Creado', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Miembros', value: guild.memberCount.toString(), inline: true },
                { name: 'Canales', value: guild.channels.cache.size.toString(), inline: true },
                { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true }
            )
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [serverEmbed] });
    },
};
