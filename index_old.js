require('dotenv').config();
const { Client, GatewayIntentBits, Events, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ] 
});

// Evento cuando el bot se conecta
client.once(Events.ClientReady, readyClient => {
    console.log('Bot iniciado correctamente');
    console.log(`Conectado como ${readyClient.user.tag}!`);
    
    // Configurar Rich Presence
    const updatePresence = () => {
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalServers = client.guilds.cache.size;
        
        client.user.setPresence({
            activities: [{
                name: `${totalMembers} usuarios en ${totalServers} servidores`,
                type: 3 // WATCHING
            }],
            status: 'online'
        });
    };
    
    updatePresence();
    setInterval(updatePresence, 10 * 60 * 1000);
});

// Manejar interacciones de slash commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'ban') {
            await handleBanCommand(interaction);
        } else if (commandName === 'kick') {
            await handleKickCommand(interaction);
        } else if (commandName === 'timeout') {
            await handleTimeoutCommand(interaction);
        } else if (commandName === 'clear') {
            await handleClearCommand(interaction);
        } else if (commandName === 'warn') {
            await handleWarnCommand(interaction);
        } else if (commandName === 'slowmode') {
            await handleSlowmodeCommand(interaction);
        } else if (commandName === 'userinfo') {
            await handleUserInfoCommand(interaction);
        } else if (commandName === 'serverinfo') {
            await handleServerInfoCommand(interaction);
        } else if (commandName === 'avatar') {
            await handleAvatarCommand(interaction);
        } else if (commandName === 'ping') {
            await handlePingCommand(interaction);
        }
    } catch (error) {
        console.error('Error manejando comando:', error);
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: '❌ Ocurrió un error al procesar el comando.',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: '❌ Ocurrió un error al procesar el comando.',
                ephemeral: true
            });
        }
    }
});

// Funciones de comandos de moderación originales
async function handleBanCommand(interaction) {
    const target = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') || 'No se especificó razón';

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return await interaction.reply({
            content: '❌ No tienes permisos para banear miembros.',
            ephemeral: true
        });
    }

    try {
        await interaction.guild.bans.create(target, { reason });
        
        const banEmbed = new EmbedBuilder()
            .setTitle('🔨 Usuario Baneado')
            .setDescription(`**Usuario:** ${target.tag}\n**Razón:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
            .setColor('#ff0000')
            .setTimestamp();

        await interaction.reply({ embeds: [banEmbed] });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: `❌ Error al banear a ${target.tag}. Verifica que el bot tenga permisos suficientes.`,
            ephemeral: true
        });
    }
}

async function handleKickCommand(interaction) {
    const target = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('razon') || 'No se especificó razón';

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return await interaction.reply({
            content: '❌ No tienes permisos para expulsar miembros.',
            ephemeral: true
        });
    }

    try {
        const member = await interaction.guild.members.fetch(target.id);
        await member.kick(reason);
        
        const kickEmbed = new EmbedBuilder()
            .setTitle('👢 Usuario Expulsado')
            .setDescription(`**Usuario:** ${target.tag}\n**Razón:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
            .setColor('#ff9900')
            .setTimestamp();

        await interaction.reply({ embeds: [kickEmbed] });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: `❌ Error al expulsar a ${target.tag}. Verifica que el bot tenga permisos suficientes.`,
            ephemeral: true
        });
    }
}

async function handleTimeoutCommand(interaction) {
    const target = interaction.options.getUser('usuario');
    const duration = interaction.options.getInteger('duracion');
    const reason = interaction.options.getString('razon') || 'No se especificó razón';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return await interaction.reply({
            content: '❌ No tienes permisos para aplicar timeouts.',
            ephemeral: true
        });
    }

    try {
        const member = await interaction.guild.members.fetch(target.id);
        const timeoutDuration = duration * 60 * 1000;
        
        await member.timeout(timeoutDuration, reason);
        
        const timeoutEmbed = new EmbedBuilder()
            .setTitle('⏰ Usuario en Timeout')
            .setDescription(`**Usuario:** ${target.tag}\n**Duración:** ${duration} minutos\n**Razón:** ${reason}\n**Moderador:** ${interaction.user.tag}`)
            .setColor('#ffff00')
            .setTimestamp();

        await interaction.reply({ embeds: [timeoutEmbed] });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: `❌ Error al aplicar timeout a ${target.tag}. Verifica que el bot tenga permisos suficientes.`,
            ephemeral: true
        });
    }
}

// Nuevas funciones de comandos
async function handleClearCommand(interaction) {
    const cantidad = interaction.options.getInteger('cantidad');
    const usuario = interaction.options.getUser('usuario');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return await interaction.reply({
            content: '❌ No tienes permisos para gestionar mensajes.',
            ephemeral: true
        });
    }

    try {
        let messages;
        if (usuario) {
            const allMessages = await interaction.channel.messages.fetch({ limit: 100 });
            messages = allMessages.filter(msg => msg.author.id === usuario.id).first(cantidad);
        } else {
            messages = await interaction.channel.messages.fetch({ limit: cantidad });
        }

        await interaction.channel.bulkDelete(messages);

        const clearEmbed = new EmbedBuilder()
            .setTitle('🧹 Mensajes Borrados')
            .setDescription(`**Cantidad:** ${messages.size} mensajes\n**Canal:** ${interaction.channel}\n**Moderador:** ${interaction.user.tag}${usuario ? `\n**Usuario:** ${usuario.tag}` : ''}`)
            .setColor('#00ff00')
            .setTimestamp();

        await interaction.reply({ embeds: [clearEmbed], ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: '❌ Error al borrar mensajes. Los mensajes deben tener menos de 14 días.',
            ephemeral: true
        });
    }
}

async function handleWarnCommand(interaction) {
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
}

async function handleSlowmodeCommand(interaction) {
    const segundos = interaction.options.getInteger('segundos');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return await interaction.reply({
            content: '❌ No tienes permisos para gestionar canales.',
            ephemeral: true
        });
    }

    try {
        await interaction.channel.setRateLimitPerUser(segundos);

        const slowmodeEmbed = new EmbedBuilder()
            .setTitle('🐌 Modo Lento Configurado')
            .setDescription(`**Canal:** ${interaction.channel}\n**Cooldown:** ${segundos} segundos\n**Moderador:** ${interaction.user.tag}`)
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [slowmodeEmbed] });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: '❌ Error al configurar el modo lento.',
            ephemeral: true
        });
    }
}

async function handleUserInfoCommand(interaction) {
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
}

async function handleServerInfoCommand(interaction) {
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
}

async function handleAvatarCommand(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;

    const avatarEmbed = new EmbedBuilder()
        .setTitle(`🖼️ Avatar de ${target.tag}`)
        .setImage(target.displayAvatarURL({ dynamic: true, size: 512 }))
        .setColor('#0099ff')
        .setTimestamp();

    await interaction.reply({ embeds: [avatarEmbed] });
}

async function handlePingCommand(interaction) {
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
}

// Manejar errores no capturados
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Iniciar el bot
client.login(process.env.DISCORD_TOKEN);
