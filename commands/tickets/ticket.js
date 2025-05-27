const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { createTicketPanel } = require('../../utils/ticketUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Gestionar sistema de tickets')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configurar el panel de tickets')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal donde enviar el panel de tickets')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'setup') {
            const channel = interaction.options.getChannel('canal');
            
            await interaction.deferReply();
            
            try {
                await createTicketPanel(channel);
                await interaction.editReply(`✅ Panel de tickets creado en ${channel}`);
            } catch (error) {
                console.error('Error creando panel:', error);
                await interaction.editReply('❌ Error creando panel de tickets');
            }
        }
    },
};
