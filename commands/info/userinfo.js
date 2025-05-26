const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información de un usuario')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario del que obtener información')
                .setRequired(false)),
    
    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id);

        const userEmbed = new EmbedBuilder()
            .setTitle(`📋 Información de ${target.tag}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: target.id, inline: true },
                { name: 'Cuenta creada', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Se unió al servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Roles', value: member.roles.cache.map(role => role.toString()).join(' ') || 'Sin roles', inline: false }
            )
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [userEmbed] });
    },
};
