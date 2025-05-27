const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { pool } = require('../../config/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Añadir usuario al ticket')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario a añadir')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        
        // Verificar que es un ticket
        const [ticketRows] = await pool.execute(
            'SELECT * FROM tickets WHERE channel_id = ?',
            [interaction.channel.id]
        );

        if (ticketRows.length === 0) {
            return await interaction.reply({ content: '❌ Este canal no es un ticket', ephemeral: true });
        }

        try {
            await interaction.channel.permissionOverwrites.create(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            await interaction.reply(`✅ ${user} añadido al ticket`);
        } catch (error) {
            await interaction.reply({ content: '❌ Error añadiendo usuario', ephemeral: true });
        }
    },
};
