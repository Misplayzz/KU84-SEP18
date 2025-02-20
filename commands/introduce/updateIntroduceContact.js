const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update-introduce-contact')
        .setDescription('Update your introduction contact information.')
        .addStringOption(option =>
                option.setName('new_username').setDescription('Enter your new contact information.').setRequired(true)
                ),

    async execute(interaction) {
        try {
            // Check if the user has the required role
            if (!interaction.member.roles.cache.has(config.indRole)) {
                await interaction.reply({
                    content: `You do not have the required role to use this command.`,
                    flags: 64,
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

            const newContact = interaction.options.getString('new_username');
            const formattedContact = formatContactText(newContact); // Use the existing formatContactText function

            let messageCount = 0;

            // Function to update the contact information in the embed
            const updateContact = async (message) => {
                const embeds = message.embeds;
                if (!embeds.length) return;

                const oldEmbed = embeds[0];

                // Check if the embed matches the desired conditions (confirmed intro with a user tagged)
                if (oldEmbed.title === 'Introduction has been confirmed.✅' && message.mentions.users.size > 0) {
                    const taggedUser = message.mentions.users.first();

                    // Check if the tagged user is the one executing the command
                    if (taggedUser.id !== interaction.user.id) return;

                    // Update the description with the new contact information
                    let description = oldEmbed.description;
                    const contactRegex = /\*\*Contact\*\*\n(.+)/s;
                    if (contactRegex.test(description)) {
                        description = description.replace(contactRegex, `**Contact**\n[IG](https://www.instagram.com/${formattedContact})`);
                    } else {
                        description += `\n\n**Contact**\n${formattedContact}`;
                    }

                    // Create a new embed with the updated description
                    const newEmbed = EmbedBuilder.from(oldEmbed).setDescription(description);

                    // Update the message with the new embed
                    await message.edit({ embeds: [newEmbed] });
                    console.log(`Updated contact for ${taggedUser.tag}`);
                    messageCount++;
                }
            };

            // Fetch messages in the channel and update them in batches of 100
            let fetchedMessages = [];
            let lastMessageId = null;
            do {
                const options = { limit: 100 };
                if (lastMessageId) {
                    options.before = lastMessageId;
                }

                const messages = await targetChannel.messages.fetch(options);
                if (messages.size === 0) break;

                fetchedMessages = Array.from(messages.values());
                for (const message of fetchedMessages) {
                    await updateContact(message);
                }

                lastMessageId = fetchedMessages[fetchedMessages.length - 1].id;

            } while (fetchedMessages.length > 0);

            if (messageCount > 0) {
                await interaction.editReply({
                    content: `Successfully updated contact.`,
                    flags: 64,
                });
            } else {
                await interaction.editReply({
                    content: `No matching introduction message found to update.`,
                    flags: 64,
                });
            }

        } catch (error) {
            console.error('Error executing update-introduce-contact:', error);
            if (!interaction.replied) {
                await interaction.editReply({ content: 'An error occurred while updating the contact information.' });
            }
        }
    },
};

// Helper function to format contact information to Markdown hyperlinks (from your original code)
function formatContactText(text) {
    let cleanedText = text.trim();
    if (!cleanedText) return 'No contact information provided.';

    const contactEntries = cleanedText.split(',');
    let formattedContact = [];

    for (const entry of contactEntries) {
        const trimmedEntry = entry.trim();
        if (!trimmedEntry) continue;

        const contactTypeMatch = trimmedEntry.match(/^(IG|FB|X|Line):\s*([a-zA-Z0-9._-]+)/i);

        if (contactTypeMatch) {
            const type = contactTypeMatch[1].toUpperCase();
            const username = contactTypeMatch[2].trim();

            let link = '';
            switch (type) {
                case 'IG': link = `https://instagram.com/${username}`; break;
                default: link = '';
            }

            const markdownLink = "[" + type + "](" + link + ")";
            formattedContact.push(markdownLink);
        } else {
            formattedContact.push(trimmedEntry);
        }
    }

    const finalContactText = formattedContact.join('\n').trim();
    return finalContactText;
}
