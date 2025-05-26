const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Muestra la latencia del bot'),
    
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Calculando ping...', fetchReply: true });
        const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;

        const pingEmbed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Latencia del bot', value: `${timeDiff}ms`, inline: true },
                { name: 'Latencia de la API', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
            )
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [pingEmbed] });
    },
};
