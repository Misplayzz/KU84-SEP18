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
                await interaction.reply({ content: `You aren't the owner. Only <@${config.ownerId}> can use this command. If you need assistance, please contact the bot owner.`, ephemeral: true });
                return;
            }


            // Immediately acknowledge the interaction
            await interaction.deferReply({ ephemeral: false });

            
            const targetChannel = interaction.guild.channels.cache.get(config.indEmbedChannel);
            if (!targetChannel) {
                console.log('Target channel not found.');
                await interaction.editReply({ content: 'Error: Target channel not found.' });
                return;
            }

            // Fetch all messages in the channel
            const messages = await targetChannel.messages.fetch();

            // Function to update embed with the new avatar URL
            const updateAvatar = async (message) => {
                const embeds = message.embeds;
                if (!embeds.length) return;

                const oldEmbed = embeds[0];

                // Check if the embed has a matching title and tagged user
                if (oldEmbed.title === 'Introduction has been confirmed.✅' && message.mentions.users.size > 0) {
                    const taggedUser = message.mentions.users.first();
                    const currentAvatarURL = taggedUser.displayAvatarURL({ dynamic: true });

                    // Check if the current avatar matches the one in the embed
                    if (oldEmbed.thumbnail && oldEmbed.thumbnail.url === currentAvatarURL) {
                        return;
                    }

                    const newEmbed = EmbedBuilder.from(oldEmbed)
                        .setThumbnail(currentAvatarURL);

                    // Update the message with the new embed
                    await message.edit({ embeds: [newEmbed] });
                }
            };

            // Loop through each message and update the embed if necessary
            for (const message of messages.values()) {
                await updateAvatar(message);
            }

            // Send confirmation message
            await interaction.editReply({ content: `Avatar in <#${config.indEmbedChannel}> has been updated.`, ephemeral: false });
        } catch (error) {
            console.error('Error executing update_introduce_avatar:', error);
            if (!interaction.replied) {
                await interaction.editReply({ content: 'An error occurred while updating the avatar.' });
            }
        }
    },
};
