const { ChannelType } = require('discord.js');  // ต้องการนำเข้า ChannelType

let timer;

async function createVoiceChannel(interaction) {
    const channelName = interaction.options.getString('channel_name');
    const category = interaction.channel.parent;

    if (!category) {
        return interaction.reply({ content: 'Cannot create a voice channel because this channel is not inside a category.', flags: 64 });
    }

    try {
        const newChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,  // ใช้ ChannelType.GuildVoice แทน 'GUILD_VOICE'
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // @everyone role
                    deny: ['CONNECT'],
                },
            ],
        });

        // ตรวจสอบว่า interaction ยังไม่ได้ตอบกลับ
        if (!interaction.replied) {
            await interaction.reply({ content: `Voice channel "${channelName}" created successfully.`, flags: 64 });
        } else {
            await interaction.followUp({ content: `Voice channel "${channelName}" created successfully.`, flags: 64 });
        }

        // Store the new channel's ID
        const newChannelId = newChannel.id;

        // Function to restart the timer for deleting the channel if empty
        function restartEmptyChannelTimer() {
            clearTimeout(timer);
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
        timer = setTimeout(async () => {
            const channel = await interaction.guild.channels.fetch(newChannelId);
            if (channel.members.size === 0) {
                await channel.delete();
                await interaction.editReply({ content: 'Voice channel deleted because it was empty for 5 minutes.' });
                console.log('Voice channel deleted because it was empty for 5 minutes.');
            }
        }, 5 * 60 * 1000); // 5 minutes

        // ใช้ client.on แทน guild.on สำหรับการรับ event voiceStateUpdate
        client.on('voiceStateUpdate', (oldState, newState) => {
            if (oldState.channelId === newChannelId || newState.channelId === newChannelId) {
                if (newState.channelId === newChannelId) {
                    console.log(`Canceling delete timer for voice channel: "${channelName}"`);
                    clearTimeout(timer);  // Clear any existing timers
                } else if (oldState.channelId === newChannelId) {
                    console.log(`Starting delete timer for empty voice channel: "${channelName}"`);
                    restartEmptyChannelTimer();  // Restart the timer to delete the channel if empty
                }
            }
        });
    } catch (error) {
        console.error('Error creating voice channel:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: 'An error occurred while creating the voice channel.', flags: 64 });
        }
    }
}
