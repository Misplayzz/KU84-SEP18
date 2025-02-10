const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const config = require('../../config.json'); // Load allowedChannelIds from config.json

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-voice-channel')
        .setDescription('Create a voice channel.')
        .addStringOption(option =>
            option.setName('channel_name')
                .setDescription('The name of the voice channel to create.')
                .setRequired(true)
        ),

    async execute(interaction) {
        // Check if the command is used in an allowed channel
        if (!config.allowedChannelIds.includes(interaction.channel.id)) {
            return interaction.reply({
                content: `You can only use this command in the following channels: ${config.allowedChannelIds.map(id => `<#${id}>`).join(', ')}`,
                flags: 64
            });
        }

        // Get the channel name from the user's input
        const channelName = interaction.options.getString('channel_name');

        // Ensure the command is used within a category
        const category = interaction.channel.parent;
        if (!category) {
            return interaction.Reply({
                content: 'Cannot create a voice channel because this channel is not inside a category.'
            });
        }

        try {
            // Create a new voice channel within the same category
            const newVoiceChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildVoice,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers],
                    }
                ]
            });

            // Update the deferred reply
            await interaction.Reply({
                content: `✅ Voice channel created successfully.\n**__If no one is in this voice channel for more than 5 minutes, it will be deleted.__**`
            });

            // Start tracking inactivity for deletion
            setTimeout(async () => {
                // Check if the channel is empty after 5 minutes
                if (newVoiceChannel.members.size === 0) {
                    await newVoiceChannel.delete().catch(console.error);
                    // Inform the user that the channel was deleted
                    await interaction.followUp({
                        content: `🗑️ Voice channel was deleted because it was empty for 5 minutes.`,
                        flags: 64
                    });
                }
            }, 5 * 60 * 1000); // 5 minutes in milliseconds

        } catch (error) {
            console.error('Error creating voice channel:', error);
            return interaction.editReply({
                content: '❌ An error occurred while creating the voice channel. Please try again.'
            });
        }
    }
};
