const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disable-voice-channel-update')
        .setDescription('Disable voice channel join/move/leave notifications.'),
    async execute(interaction) {
        if (interaction.user.id !== config.ownerId) {
            await interaction.reply({ content: `You aren't the owner. Only <@${config.ownerId}> can use this command. If you need assistance, please contact the bot owner.`, ephemeral: true });
            return;
            }
        fs.writeFileSync('enable.json', JSON.stringify({ enabled: false }));
        await interaction.reply('Voice channel join/move/leave notifications disabled.');
    },
};

