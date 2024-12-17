const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

require('./open-server');

const token = process.env.TOKEN; // Ensure the environment variable is correctly named and loaded
const apiKey = process.env.APIKEY;
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const deployCommands = require('./deploy-commands');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

(async () => {
    try {
        // Get the Spotify Access Token
        //const accessToken = await getAccessToken();
        //console.log('Spotify Access Token:', accessToken);
        console.log('YouTube apiKey:', apiKey);

        // Deploy commands
        await deployCommands();

        // Log in the client to Discord
        await client.login(token);
    } catch (error) {
        console.error('Error:', error);
    }
})();
