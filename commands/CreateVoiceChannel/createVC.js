const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

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
    const channelName = interaction.options.getString('channel_name');
    const allowedChannelIds = config.allowedChannelIds;
    const channelId = interaction.channelId;

    if (!allowedChannelIds.includes(channelId)) {
      return interaction.reply({
        content: `You can only use this command in the following channels: ${config.allowedChannelIds.map(id => `<#${id}>`).join(', ')}`,
        flags: 64
      });
    }

    const category = interaction.channel.parent;
    if (!category) {
      return interaction.reply({
        content: 'Cannot create a voice channel because this channel is not inside a category.',
        flags: 64
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
        flags: 64
      });

      const newChannelId = newChannel.id;
      let timer;
      let isTimerRunning = false;

      // Function to start the delete timer
      function startDeleteTimer() {
        if (isTimerRunning) return; // Don't start if timer is already running
        console.log(`Starting delete timer for empty voice channel: "${channelName}"`);
        isTimerRunning = true;
        timer = setTimeout(async () => {
          try {
            // Refresh the channel to ensure updated member info
            const fetchedChannel = await interaction.guild.channels.fetch(newChannelId);
            if (fetchedChannel && fetchedChannel.members.size === 0) {
              await fetchedChannel.delete();
              await interaction.editReply({ content: 'Voice channel deleted because it was empty for 5 minutes.' });
              console.log('Voice channel deleted because it was empty for 5 minutes.');
              // Remove the event listener after deletion
              interaction.client.removeListener('voiceStateUpdate', voiceStateHandler);
            }
          } catch (error) {
            if (error.code === 10003) {
              console.log(`Channel ${newChannelId} does not exist anymore. Skipping deletion.`);
              interaction.client.removeListener('voiceStateUpdate', voiceStateHandler);
            } else {
              console.error('Error fetching channel:', error);
            }
          } finally {
            isTimerRunning = false;
          }
        }, 5 * 60 * 1000); // 5 minutes
      }

      // Function to cancel any running timer
      function cancelDeleteTimer() {
        if (isTimerRunning) {
          clearTimeout(timer);
          isTimerRunning = false;
          console.log(`Canceling delete timer for voice channel: "${channelName}"`);
        }
      }

      // voiceStateUpdate event handler
      const voiceStateHandler = async (oldState, newState) => {
        // We're only interested in changes related to our new channel.
        // If the event doesn't involve our channel, ignore it.
        if (oldState.channelId !== newChannelId && newState.channelId !== newChannelId) return;

        // Member joined the channel
        if (newState.channelId === newChannelId) {
          cancelDeleteTimer();
        }
        // Member left the channel
        else if (oldState.channelId === newChannelId) {
          // Use fetch to ensure we get the updated member list
          const fetchedChannel = await interaction.guild.channels.fetch(newChannelId);
          // If channel exists and is empty, start the timer
          if (fetchedChannel && fetchedChannel.members.size === 0) {
            startDeleteTimer();
          }
        }
      };

      // Immediately start the delete timer upon creation
      startDeleteTimer();

      // Listen to voiceStateUpdate events
      interaction.client.on('voiceStateUpdate', voiceStateHandler);
    } catch (error) {
      console.error('Error creating voice channel:', error);
      await interaction.reply({
        content: 'An error occurred while creating the voice channel. Please try again.',
        flags: 64
      });
    }
  },
};
