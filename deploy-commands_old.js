require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    // Comandos de moderación originales
    {
        name: 'ban',
        description: 'Banea a un miembro del servidor',
        options: [
            {
                name: 'usuario',
                description: 'El usuario a banear',
                type: 6,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón del baneo',
                type: 3,
                required: false
            }
        ],
        default_member_permissions: '4'
    },
    {
        name: 'kick',
        description: 'Expulsa a un miembro del servidor',
        options: [
            {
                name: 'usuario',
                description: 'El usuario a expulsar',
                type: 6,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón de la expulsión',
                type: 3,
                required: false
            }
        ],
        default_member_permissions: '2'
    },
    {
        name: 'timeout',
        description: 'Aplica timeout a un miembro',
        options: [
            {
                name: 'usuario',
                description: 'El usuario a silenciar',
                type: 6,
                required: true
            },
            {
                name: 'duracion',
                description: 'Duración en minutos',
                type: 4,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón del timeout',
                type: 3,
                required: false
            }
        ],
        default_member_permissions: '1099511627776'
    },
    // Nuevos comandos de moderación
    {
        name: 'clear',
        description: 'Borra una cantidad específica de mensajes',
        options: [
            {
                name: 'cantidad',
                description: 'Número de mensajes a borrar (1-100)',
                type: 4,
                required: true,
                min_value: 1,
                max_value: 100
            },
            {
                name: 'usuario',
                description: 'Borrar solo mensajes de este usuario',
                type: 6,
                required: false
            }
        ],
        default_member_permissions: '8192'
    },
    {
        name: 'warn',
        description: 'Advierte a un usuario',
        options: [
            {
                name: 'usuario',
                description: 'Usuario a advertir',
                type: 6,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón de la advertencia',
                type: 3,
                required: true
            }
        ],
        default_member_permissions: '8192'
    },
    {
        name: 'slowmode',
        description: 'Establece el modo lento en el canal',
        options: [
            {
                name: 'segundos',
                description: 'Segundos de cooldown (0-21600)',
                type: 4,
                required: true,
                min_value: 0,
                max_value: 21600
            }
        ],
        default_member_permissions: '16'
    },
    // Comandos de información
    {
        name: 'userinfo',
        description: 'Muestra información de un usuario',
        options: [
            {
                name: 'usuario',
                description: 'Usuario del que obtener información',
                type: 6,
                required: false
            }
        ]
    },
    {
        name: 'serverinfo',
        description: 'Muestra información del servidor'
    },
    // Comandos de utilidad
    {
        name: 'avatar',
        description: 'Muestra el avatar de un usuario',
        options: [
            {
                name: 'usuario',
                description: 'Usuario del que mostrar el avatar',
                type: 6,
                required: false
            }
        ]
    },
    {
        name: 'ping',
        description: 'Muestra la latencia del bot'
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registrando comandos de aplicación...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log('Comandos registrados exitosamente!');
        console.log('Comandos disponibles:');
        commands.forEach(cmd => console.log(`- /${cmd.name}`));
    } catch (error) {
        console.error(error);
    }
})();
