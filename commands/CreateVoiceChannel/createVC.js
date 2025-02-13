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
            return interaction.reply({ 
                content: `You can only use this command in the following channels: ${config.allowedChannelIds.map(id => `<#${id}>`).join(', ')}`, 
                ephemeral: true 
            });
        }

        const category = interaction.channel.parent;

        if (!category) {
            return interaction.reply({ 
                content: 'Cannot create a voice channel because this channel is not inside a category.', 
                ephemeral: true 
            });
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

            console.log(`Voice channel "${channelName}" created successfully.`);

            await interaction.reply({ 
                content: `Voice channel <#${newChannel.id}> created successfully.\n**__If no one is in this voice channel for more than 5 minutes, it will be deleted.__**`, 
                ephemeral: true 
            });

            const newChannelId = newChannel.id;
            let timer;

            function restartEmptyChannelTimer() {
                clearTimeout(timer);
                console.log(`Starting delete timer for empty voice channel: "${channelName}"`);

                timer = setTimeout(async () => {
                    const channel = interaction.guild.channels.cache.get(newChannelId);
                    if (!channel) {
                        console.log(`Voice channel "${channelName}" no longer exists. Skipping deletion.`);
                        return;
                    }

                    try {
                        const fetchedChannel = await interaction.guild.channels.fetch(newChannelId);
                        if (fetchedChannel.members.size === 0) {
                            await fetchedChannel.delete();
                            await interaction.editReply({ content: 'Voice channel deleted because it was empty for 5 minutes.' });
                            console.log('Voice channel deleted because it was empty for 5 minutes.');
                        }
                    } catch (error) {
                        if (error.code === 10003) {
                            console.log(`Channel ${newChannelId} does not exist anymore. Skipping deletion.`);
                        } else {
                            console.error('Error fetching channel:', error);
                        }
                    }
                }, 5 * 60 * 1000); // 5 minutes
            }

            restartEmptyChannelTimer();

            interaction.client.on('voiceStateUpdate', (oldState, newState) => {
                if (oldState.channelId === newChannelId || newState.channelId === newChannelId) {
                    if (newState.channelId === newChannelId) {
                        console.log(`Canceling delete timer for voice channel: "${channelName}"`);
                        clearTimeout(timer);
                    } else if (oldState.channelId === newChannelId) {
                        console.log(`Starting delete timer for empty voice channel: "${channelName}"`);
                        restartEmptyChannelTimer();
                    }
                }
            });
        } catch (error) {
            console.error('Error creating voice channel:', error);
            await interaction.reply({ 
                content: 'An error occurred while creating the voice channel. Please try again.', 
                ephemeral: true 
            });
        }
    },
};
