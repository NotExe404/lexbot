const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log('Bot iniciado correctamente');
        console.log(`Conectado como ${client.user.tag}!`);
        
        // Rich Presence
        const updatePresence = () => {
            const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const totalServers = client.guilds.cache.size;
            
            client.user.setPresence({
                activities: [{
                    name: `${totalMembers} usuarios en ${totalServers} servidores`,
                    type: 3
                }],
                status: 'online'
            });
        };
        
        updatePresence();
        setInterval(updatePresence, 10 * 60 * 1000);
    },
};
