const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const mysql = require('mysql2/promise');

// Conexión a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

async function getTicketConfig(guildId) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM ticket_config WHERE guild_id = ?',
            [guildId]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Error obteniendo config de tickets:', error);
        return null;
    }
}

async function createTicket(guild, user, category = 'general') {
    try {
        const config = await getTicketConfig(guild.id);
        if (!config || !config.enabled) {
            return { success: false, message: 'Sistema de tickets deshabilitado' };
        }

        // Verificar límite de tickets por usuario
        const [existingTickets] = await pool.execute(
            'SELECT COUNT(*) as count FROM tickets WHERE guild_id = ? AND user_id = ? AND status IN ("open", "claimed")',
            [guild.id, user.id]
        );

        if (existingTickets[0].count >= config.max_tickets_per_user) {
            return { success: false, message: `Ya tienes ${config.max_tickets_per_user} tickets abiertos` };
        }

        // Crear canal del ticket
        const ticketNumber = Date.now().toString().slice(-6);
        const channelName = `ticket-${user.username}-${ticketNumber}`;

        const ticketChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: config.category_id || null,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ]
        });

        // Añadir rol de soporte si está configurado
        if (config.support_role_id) {
            await ticketChannel.permissionOverwrites.create(config.support_role_id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
        }

        // Guardar ticket en base de datos
        await pool.execute(
            'INSERT INTO tickets (guild_id, channel_id, user_id, category, status) VALUES (?, ?, ?, ?, ?)',
            [guild.id, ticketChannel.id, user.id, category, 'open']
        );

        // Crear embed de bienvenida
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎫 Nuevo Ticket Creado')
            .setDescription(config.welcome_message || 'Gracias por crear un ticket. Un miembro del staff te ayudará pronto.')
            .setColor('#00ff00')
            .addFields(
                { name: '👤 Usuario', value: `${user}`, inline: true },
                { name: '📂 Categoría', value: category, inline: true },
                { name: '🕐 Creado', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: `Ticket #${ticketNumber}` });

        // Botones de control del ticket
        const ticketButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('claim_ticket')
                    .setLabel('Reclamar')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✋'),
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Cerrar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('transcript_ticket')
                    .setLabel('Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📄')
            );

        await ticketChannel.send({
            content: `${user} ${config.support_role_id ? `<@&${config.support_role_id}>` : ''}`,
            embeds: [welcomeEmbed],
            components: [ticketButtons]
        });

        return { success: true, channel: ticketChannel };

    } catch (error) {
        console.error('Error creando ticket:', error);
        return { success: false, message: 'Error interno al crear ticket' };
    }
}

async function closeTicket(channel, closedBy, reason = 'No especificada') {
    try {
        // Obtener información del ticket
        const [ticketRows] = await pool.execute(
            'SELECT * FROM tickets WHERE channel_id = ? AND status IN ("open", "claimed")',
            [channel.id]
        );

        if (ticketRows.length === 0) {
            return { success: false, message: 'Este canal no es un ticket válido' };
        }

        const ticket = ticketRows[0];

        // Actualizar ticket en base de datos
        await pool.execute(
            'UPDATE tickets SET status = "closed", closed_at = NOW(), close_reason = ? WHERE id = ?',
            [reason, ticket.id]
        );

        // Crear embed de cierre
        const closeEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket Cerrado')
            .setDescription(`Este ticket ha sido cerrado por ${closedBy}`)
            .setColor('#ff0000')
            .addFields(
                { name: '📝 Razón', value: reason, inline: false },
                { name: '🕐 Cerrado', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            );

        await channel.send({ embeds: [closeEmbed] });

        // Eliminar canal después de 10 segundos
        setTimeout(async () => {
            try {
                await channel.delete();
            } catch (error) {
                console.error('Error eliminando canal:', error);
            }
        }, 10000);

        return { success: true };

    } catch (error) {
        console.error('Error cerrando ticket:', error);
        return { success: false, message: 'Error interno al cerrar ticket' };
    }
}

async function createTicketPanel(channel) {
    const panelEmbed = new EmbedBuilder()
        .setTitle('🎫 Sistema de Tickets')
        .setDescription('¿Necesitas ayuda? Crea un ticket seleccionando una categoría:')
        .setColor('#0099ff')
        .addFields(
            { name: '🔧 Soporte Técnico', value: 'Problemas técnicos y bugs', inline: true },
            { name: '❓ Preguntas Generales', value: 'Dudas sobre el servidor', inline: true },
            { name: '⚠️ Reportes', value: 'Reportar usuarios o problemas', inline: true }
        )
        .setFooter({ text: 'Haz clic en un botón para crear un ticket' });

    const ticketButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket_support')
                .setLabel('Soporte Técnico')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔧'),
            new ButtonBuilder()
                .setCustomId('create_ticket_general')
                .setLabel('Preguntas')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('❓'),
            new ButtonBuilder()
                .setCustomId('create_ticket_report')
                .setLabel('Reportes')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('⚠️')
        );

    await channel.send({
        embeds: [panelEmbed],
        components: [ticketButtons]
    });
}

module.exports = {
    createTicket,
    closeTicket,
    createTicketPanel,
    getTicketConfig,
    pool
};
