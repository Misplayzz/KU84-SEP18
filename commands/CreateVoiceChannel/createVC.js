const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-voice-channel')
        .setDescription('Create a voice channel.')
        .addStringOption(option =>
            option.setName('channel_name')
                .setDescription('The name of the voice channel to create.')
                .setRequired(true)),
    async execute(interaction) {
        const channelName = interaction.options.getString('channel_name');
        const allowedChannelIds = config.allowedChannelIds;
        const channelId = interaction.channelId;

        if (!allowedChannelIds.includes(channelId)) {
            return interaction.reply({ content: `You can only use this command in the following channels: ${config.allowedChannelIds.map(id => `<#${id}>`).join(', ')}`, flags: 64 });
        }

        const category = interaction.channel.parent;

        if (!category) {
            return interaction.reply({ content: 'Cannot create a voice channel because this channel is not inside a category.', flags: 64 });
        }

        try {
            const newChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildVoice,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // @everyone role
                        allow: [PermissionFlagsBits.Connect],
                    },
                ],
            });

            // Log the creation of the channel
            console.log(`Voice channel "${channelName}" created successfully.`);

            // Notify user about the new channel
            await interaction.reply({ content: `Voice channel <#${newChannel.id}> created successfully.\n**__If no one is in this voice channel for more than 5 minutes, it will be deleted.__**`, flags: 64 });

            // Store the new channel's ID
            const newChannelId = newChannel.id;
            let timer; // Declare the timer variable outside

            // Function to restart the timer for deleting the channel if empty
            function restartEmptyChannelTimer() {
                clearTimeout(timer); // Clear any existing timer
                console.log(`Starting delete timer for empty voice channel: "${channelName}"`);  // Debugging log
                timer = setTimeout(async () => {
                    const channel = await interaction.guild.channels.fetch(newChannelId);
                    if (channel.members.size === 0) {
                        await channel.delete();
                        await interaction.editReply({ content: 'Voice channel deleted because it was empty for 5 minutes.' });
                        console.log('Voice channel deleted because it was empty for 5 minutes.');
                    }
                }, 5 * 60 * 1000); // 5 minutes
            }

            // Start the timer to delete the channel if empty
            restartEmptyChannelTimer(); // Start the initial timer

            // Listen for voiceStateUpdate to restart the timer when needed
            interaction.client.on('voiceStateUpdate', (oldState, newState) => {
                if (oldState.channelId === newChannelId || newState.channelId === newChannelId) {
                    if (newState.channelId === newChannelId) {
                        console.log(`Canceling delete timer for voice channel: "${channelName}"`);
                        clearTimeout(timer);  // Clear existing timer
                    } else if (oldState.channelId === newChannelId) {
                        console.log(`Starting delete timer for empty voice channel: "${channelName}"`);
                        restartEmptyChannelTimer();  // Restart the timer to delete the channel if empty
                    }
                }
            });
        } catch (error) {
            console.error('Error creating voice channel:', error);
            await interaction.reply({ content: 'An error occurred while creating the voice channel. Please try again.', flags: 64 });
        }
    },
};
