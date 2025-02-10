const { SlashCommandBuilder, ChannelType } = require('discord.js');
const config = require('../../config.json'); // Load ownerId from config.json

module.exports = {
    data: new SlashCommandBuilder()
        .setName('message-count')
        .setDescription('Displays the total number of messages in the specified channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select the channel to check the message count')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText) // Filter to only text channels
        ),

    async execute(interaction) {
        if (interaction.user.id !== config.ownerId) {
            return interaction.reply({ 
                content: `You aren't the owner. Only <@${config.ownerId}> can use this command.`, 
                flags: 64 
            });
        }

        const targetChannel = interaction.options.getChannel('channel');

        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
            return interaction.reply({ 
                content: 'Please select a valid text channel.', 
                flags: 64 
            });
        }

        try {
            let messageCount = 0;
            let lastMessageId = null;

            while (true) {
                const messages = await targetChannel.messages.fetch({
                    limit: 100,
                    before: lastMessageId,
                });

                if (!messages.size) break;

                messageCount += messages.size;
                lastMessageId = messages.lastKey(); // Optimized instead of .last().id
            }

            await interaction.reply({
                content: `There are a total of **${messageCount}** messages in <#${targetChannel.id}>.`,
                flags: 64
            });

        } catch (error) {
            console.error('Error fetching messages:', error);
            await interaction.reply({ 
                content: 'There was an error fetching the message count.', 
                flags: 64 
            });
        }
    },
};
