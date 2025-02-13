const { ChannelType } = require('discord.js');

let timer;

async function createVoiceChannel(interaction) {
    const channelName = interaction.options.getString('channel_name');
    const category = interaction.channel.parent;

    if (!category) {
        return interaction.reply({ content: 'Cannot create a voice channel because this channel is not inside a category.', ephemeral: true });
    }

    try {
        const newChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // @everyone role
                    deny: ['CONNECT'],
                },
            ],
        });

        if (!interaction.replied) {
            await interaction.reply({ content: `Voice channel "${channelName}" created successfully.`, ephemeral: true });
        } else {
            await interaction.followUp({ content: `Voice channel "${channelName}" created successfully.`, ephemeral: true });
        }

        const newChannelId = newChannel.id;

        function restartEmptyChannelTimer() {
            clearTimeout(timer);
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
            }, 5 * 60 * 1000);
        }

        restartEmptyChannelTimer();

        client.on('voiceStateUpdate', (oldState, newState) => {
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
        if (!interaction.replied) {
            await interaction.reply({ content: 'An error occurred while creating the voice channel.', ephemeral: true });
        }
    }
}
