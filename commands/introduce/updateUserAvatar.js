const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upd-ind-pro')
        .setDescription('Update introduction profile.'),

    async execute(interaction) {
        try {
            // Check if the user executing the command is the specific user from config.json
            if (interaction.user.id !== config.ownerId) {
                await interaction.reply({ 
                    content: `You aren't the owner. Only <@${config.ownerId}> can use this command.`, 
                    flags: 64
                });
                return;
            }

            // Immediately acknowledge the interaction
            await interaction.deferReply({ flags: 64 });

            // Fetch the target channel
            const targetChannel = interaction.guild.channels.cache.get(config.indEmbedChannel);
            if (!targetChannel) {
                console.log('Target channel not found.');
                await interaction.editReply({ content: 'Error: Target channel not found.' });
                return;
            }

            let updateTimes = 0; // Counter to track how many updates have been completed
            let messageCount = 0; // Counter to track the total number of messages updated

            // Function to update the avatar in the embed
            const updateAvatar = async (message) => {
                const embeds = message.embeds;
                if (!embeds.length) return;

                const oldEmbed = embeds[0];

                // Check if the embed matches the desired conditions (confirmed intro with a user tagged)
                if (oldEmbed.title === 'Introduction has been confirmed.✅' && message.mentions.users.size > 0) {
                    const taggedUser = message.mentions.users.first();
                    const currentAvatarURL = taggedUser.displayAvatarURL({ dynamic: true });

                    // If the avatar in the embed is already the current one, no need to update
                    if (oldEmbed.thumbnail && oldEmbed.thumbnail.url === currentAvatarURL) {
                        console.log(`Avatar already updated for ${taggedUser.tag}`);
                        return;
                    }

                    // Create a new embed with the updated avatar
                    const newEmbed = EmbedBuilder.from(oldEmbed).setThumbnail(currentAvatarURL);

                    // Update the message with the new embed
                    await message.edit({ embeds: [newEmbed] });
                    console.log(`Updated avatar for ${taggedUser.tag}`);
                    messageCount++;
                }
            };

            // Fetch messages in the channel and update them in batches of 100
            let fetchedMessages = [];
            let lastMessageId = null;
            do {
                const options = { limit: 100 };
                if (lastMessageId) {
                    options.before = lastMessageId; // To get the next batch of messages
                }

                const messages = await targetChannel.messages.fetch(options);
                if (messages.size === 0) break;

                fetchedMessages = Array.from(messages.values());
                for (const message of fetchedMessages) {
                    await updateAvatar(message);
                }

                lastMessageId = fetchedMessages[fetchedMessages.length - 1].id; // Save the ID of the last message for the next batch

                updateTimes++;

            } while (fetchedMessages.length > 0); // Loop until no more messages are available

            if (messageCount > 0) {
                await interaction.editReply({
                    content: `Successfully updated avatars for ${messageCount} message(s) in <#${config.indEmbedChannel}> after ${updateTimes} time(s).`,
                    flags: 64
                });
            } else {
                await interaction.editReply({
                    content: `Error to update picture in <#${config.indEmbedChannel}>. No messages found to update.`,
                    flags: 64
                });
            }

        } catch (error) {
            console.error('Error executing update_introduce_avatar:', error);
            if (!interaction.replied) {
                await interaction.editReply({ content: 'An error occurred while updating the avatar.' });
            }
        }
    },
};
