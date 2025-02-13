// index.js
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const deployCommands = require('./deploy-commands');

// Load environment variables
dotenv.config();

// Check if required environment variables are set
if (!process.env.TOKEN || !process.env.APIKEY) {
    console.error('Error: Missing required environment variables (TOKEN, APIKEY).');
    process.exit(1);  // Exit the program if necessary env variables are missing
}

const token = process.env.TOKEN;
const apiKey = process.env.APIKEY;

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers ]});

client.commands = new Collection();

// Dynamically load commands from the 'commands' folder
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

commandFolders.forEach((folder) => {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    commandFiles.forEach((file) => {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        } catch (error) {
            console.error(`Error loading command at ${filePath}:`, error);
        }
    });
});

// Dynamically load events from the 'events' folder
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

eventFiles.forEach((file) => {
    const filePath = path.join(eventsPath, file);
    try {
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
    } catch (error) {
        console.error(`Error loading event at ${filePath}:`, error);
    }
});

// Async function to handle the deployment and login process
(async () => {
    try {
        // Log API key for debugging purposes (remove or mask it in production)
        console.log('YouTube API Key:', apiKey);

        // Deploy slash commands
        await deployCommands();

        // Log in to Discord
        await client.login(token);
        console.log('Server started at:', new Date().toLocaleString());
    } catch (error) {
        console.error('Error during bot startup:', error);
        process.exit(1);  // Exit the program if there's a critical error
    }
})();
