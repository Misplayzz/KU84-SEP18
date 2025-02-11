const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();  // โหลดค่า environment variables จากไฟล์ .env

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// รับค่า token จาก environment variable
const token = process.env.TOKEN;

if (!token) {
    console.error('Token not found in .env file');
    process.exit(1);  // หยุดการทำงานหากไม่มี token
}

client.login(token).then(() => {
    console.log('Bot logged in successfully.');

    // หยุดบอท
    client.destroy().then(() => {
        console.log('Bot has been stopped.');
    }).catch(err => {
        console.error('Error stopping bot:', err);
    });
}).catch(err => {
    console.error('Error logging in:', err);
});
