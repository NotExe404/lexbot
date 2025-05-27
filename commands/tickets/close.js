const { SlashCommandBuilder } = require('discord.js');
const { closeTicket } = require('../../utils/ticketUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Cerrar el ticket actual')
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del cierre')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        
        const reason = interaction.options.getString('razon') || 'No especificada';
        const result = await closeTicket(interaction.channel, interaction.user, reason);
        
        if (result.success) {
            await interaction.editReply('🔒 Cerrando ticket...');
        } else {
            await interaction.editReply(`❌ ${result.message}`);
        }
    },
};
