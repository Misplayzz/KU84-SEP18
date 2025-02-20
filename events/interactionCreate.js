const { Events, EmbedBuilder, PermissionsBitField, InteractionType } = require('discord.js');
const config = require('../config.json');

// Helper function to format the nickname (capitalize first letter)
function formatNickname(nickname) {
    return nickname && nickname.length > 0
        ? nickname.charAt(0).toUpperCase() + nickname.slice(1)
        : '';
}

// Helper function to format text (trim and ensure proper formatting)
function formatText(text) {
    return text && text.length > 0 ? text.trim() : 'No information provided';
}

// Helper function to format text by splitting based on max length
const splitText = (text, maxLine) => {
    const words = text.split(/[\s,]+/);
    let resultLines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        let word = words[i].trim();
        if (!word) continue;

        const potentialLine = currentLine ? `${currentLine}, ${word}` : word;

        if (potentialLine.length <= maxLine) {
            currentLine = potentialLine;
        } else {
            resultLines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) {
        resultLines.push(currentLine);
    }
    return resultLines.join('\n');
};

// Helper function to create the introduction embed
function createEmbed(user, nickname, hobby, favorite, contact) {
    let description = `**Nickname**\n${nickname}\n\n**Hobby**\n${hobby}\n\n**Favorite**\n${favorite}`;

    if (contact) {
        description += `\n\n**Contact**\n${contact}`;
    }

    const embed = new EmbedBuilder()
        .setTitle('Introduction has been confirmed.✅')
        .setColor('#00FFFF')
        .setDescription(description)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    return embed;
}

// Helper function to manage roles
async function manageRoles(guild, member) {
    const newRole = guild.roles.cache.get(config.indRole);
    const oldRole = guild.roles.cache.get(config.notIndRole);
    const botMember = await guild.members.fetch(guild.client.user.id);

    if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        console.error('Bot lacks MANAGE_ROLES permission.');
        throw new Error('I do not have permission to manage roles.');
    }

    if (newRole && oldRole) {
        if (botMember.roles.highest.position <= Math.max(newRole.position, oldRole.position)) {
            console.error('Bot lacks sufficient role position.');
            throw new Error('I cannot manage roles due to position issues.');
        }
        await member.roles.add(newRole).catch(console.error);
        await member.roles.remove(oldRole).catch(console.error);
    }
}

// Helper function to set the nickname
async function setNickname(member, nickname) {
    try {
        await member.setNickname(nickname);
    } catch (error) {
        console.error('Error setting nickname:', error);
        throw new Error('Unable to set your nickname due to permission issues.');
    }
}

// Helper function to clean text input
function cleanTextInput(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',')
        .replace(/,+/g, ',')
        .trim();
}

// Function to format contact information to Markdown hyperlinks
function formatContactText(text) {
    let cleanedText = text.trim();
    if (!cleanedText) return 'No contact information provided.';

    const contactEntries = cleanedText.split(',');
    let formattedContact = [];

    for (const entry of contactEntries) {
        const trimmedEntry = entry.trim();
        if (!trimmedEntry) continue;

        const contactTypeMatch = trimmedEntry.match(/^(IG|Instagram):\s*([a-zA-Z0-9._-]+)/i);

        if (contactTypeMatch) {
            const type = contactTypeMatch[1].toUpperCase();
            const username = contactTypeMatch[2].trim();

            let link = '';
            switch (type) {
                case 'IG': link = `https://instagram.com/${username}`; break;
                default: link = '';
            }

            const markdownLink = `[${type}](${link})`;
            formattedContact.push(markdownLink);
        } else {
            formattedContact.push(trimmedEntry);
        }
    }

    const finalContactText = formattedContact.join('\n').trim();
    return finalContactText;
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(client, interaction) {
        try {
            console.log(`[InteractionCreate] Received interaction with ID: ${interaction.id} and type: ${interaction.type}`);
            console.log('[InteractionCreate] Interaction details:', {
                id: interaction?.id,
                type: interaction?.type,
                commandName: interaction?.commandName || 'N/A',
            });

            if (interaction.type === InteractionType.ApplicationCommand) {
                console.log(`[InteractionCreate] Processing command: ${interaction.commandName}`);
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return interaction.reply({ content: 'Command not found!', flags: 64 }).catch(err => console.error("Failed to reply command not found:", err));
                }

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error('Error executing command:', error, {
                        id: interaction.id,
                        type: interaction.type,
                        commandName: interaction.commandName,
                    });
                    const response = { content: 'There was an error executing this command!' };
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(response);
                    } else {
                        await interaction.reply(response);
                    }
                }
            } else if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'introduceModal') {
                console.log('[InteractionCreate] Processing modal submission: introduceModal');

                await interaction.deferReply({ flags: 64 });

                const { guild, user, member } = interaction;

                if (!guild || !member) {
                    console.error('Guild or member not found in modal interaction.', { id: interaction.id });
                    return await interaction.followUp({
                        content: 'This command can only be used in a server.',
                        flags: 64,
                    });
                }

                let nickname = formatNickname(interaction.fields.getTextInputValue('nicknameInput'));
                const hobbyInput = interaction.fields.getTextInputValue('hobbyInput');
                const favoriteInput = interaction.fields.getTextInputValue('favoriteInput');
                const contactInput = interaction.fields.getTextInputValue('contactInput');

                const cleanedHobby = cleanTextInput(hobbyInput);
                const cleanedFavorite = cleanTextInput(favoriteInput);
                const cleanedContact = cleanTextInput(contactInput);

                const maxLine = 'Introduction has been confirmed.✅'.length;

                const hobby = splitText(formatText(cleanedHobby), maxLine);
                const favorite = splitText(formatText(cleanedFavorite), maxLine);
                const contact = formatContactText(cleanedContact);

                console.log('[Debug Contact Markdown Link]:', contact);

                const embed = createEmbed(user, nickname, hobby, favorite, contact);
                const targetChannel = guild.channels.cache.get(config.indEmbedChannel);

                if (targetChannel) {
                    await targetChannel.send({ content: `${user}`, embeds: [embed] });
                }

                await manageRoles(guild, member, nickname);
                await setNickname(member, nickname);

                await interaction.followUp({
                    content: 'Your introduction has been submitted successfully! 😊',
                    flags: 64,
                });
            }
        } catch (error) {
            console.error('Unhandled error in interactionCreate:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An unexpected error occurred.', flags: 64 });
            }
        }
    },
};
