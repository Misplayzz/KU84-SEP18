const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable-voice-channel-update')
        .setDescription('Enable voice channel join/move/leave notifications.'),
    async execute(interaction) {
        if (interaction.user.id !== config.ownerId) {
            await interaction.reply({ content: `You aren't the owner. Only <@${config.ownerId}> can use this command. If you need assistance, please contact the bot owner.`, ephemeral: true });
            return;
            }
        fs.writeFileSync('enable.json', JSON.stringify({ enabled: true }));
        await interaction.reply('Voice channel join/move/leave notifications enabled.');
    },
};
 
