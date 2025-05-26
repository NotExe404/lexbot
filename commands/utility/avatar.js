const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar de un usuario')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario del que mostrar el avatar')
                .setRequired(false)),
    
    async execute(interaction) {
        const target = interaction.options.getUser('usuario') || interaction.user;

        const avatarEmbed = new EmbedBuilder()
            .setTitle(`🖼️ Avatar de ${target.tag}`)
            .setImage(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [avatarEmbed] });
    },
};
