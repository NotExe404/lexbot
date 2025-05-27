const { Events } = require('discord.js');
const { createTicket, closeTicket } = require('../utils/ticketUtils');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const { customId, user, guild, channel } = interaction;

        try {
            // Botones para crear tickets
            if (customId.startsWith('create_ticket_')) {
                const category = customId.replace('create_ticket_', '');
                
                await interaction.deferReply({ ephemeral: true });
                
                const result = await createTicket(guild, user, category);
                
                if (result.success) {
                    await interaction.editReply({
                        content: `✅ Ticket creado exitosamente: ${result.channel}`,
                        ephemeral: true
                    });
                } else {
                    await interaction.editReply({
                        content: `❌ ${result.message}`,
                        ephemeral: true
                    });
                }
            }

            // Botón para cerrar ticket
            else if (customId === 'close_ticket') {
                await interaction.deferReply();
                
                const result = await closeTicket(channel, user, 'Cerrado mediante botón');
                
                if (result.success) {
                    await interaction.editReply('🔒 Cerrando ticket en 10 segundos...');
                } else {
                    await interaction.editReply(`❌ ${result.message}`);
                }
            }

        } catch (error) {
            console.error('Error en interacción de botón:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Error interno', ephemeral: true });
            }
        }
    },
};
