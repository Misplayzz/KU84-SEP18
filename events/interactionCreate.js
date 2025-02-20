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
    return text && text.length > 0 ? text.trim() : 'No information provided';  // Trim spaces or provide default message
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

// Helper function to clean text input (No change needed here as it's cleaning text format)
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

    // **[ปรับปรุงใหม่!] Split ข้อความ Input ด้วย Comma (,) เป็นหลัก เพื่อแยก Contact แต่ละรายการ**
    const contactEntries = cleanedText.split(',');
    let formattedContact = [];

    console.log('[formatContactText] Input text:', text);
    console.log('[formatContactText] Contact Entries (Split by Comma):', contactEntries); // **[Debug] Log Contact Entries หลัง Split**


    for (const entry of contactEntries) { // **Loop วนซ้ำแต่ละ Contact Entry**
        const trimmedEntry = entry.trim(); // Trim whitespace ในแต่ละ Entry
        if (!trimmedEntry) continue; // ข้าม Entry ที่ว่างเปล่า

        // **[ปรับปรุงใหม่!] Regex สำหรับจับ Contact Type และ Username ในแต่ละ Entry**
        const contactTypeMatch = trimmedEntry.match(/^(IG|Instagram):\s*([a-zA-Z0-9._-]+)/i);//|FB|Facebook|X|Line

        console.log('[formatContactText] Loop Entry:', trimmedEntry); // **[Debug] Log Entry ใน Loop**


        if (contactTypeMatch) {
            const type = contactTypeMatch[1].toUpperCase();
            const username = contactTypeMatch[2].trim();

            console.log('[formatContactText] Found Contact Type:', type, 'Username:', username);

            let link = '';
            switch (type) {
                case 'IG': link = `https://instagram.com/${username}`; break;
                //case 'FB': link = `https://facebook.com/${username}`; break;
                //case 'X': link = `https://twitter.com/${username}`; break;
                //case 'LINE': link = `https://line.me/ti/p/~${username}`; break;
                default: link = '';
            }

            console.log('[formatContactText] Generated Link:', link);

            const markdownLink = "[" + type + "](" + link + ")"; // สร้าง Markdown Link
            formattedContact.push(markdownLink); // Push Markdown Link ลง Array
            console.log('[formatContactText] Markdown Link Created:', markdownLink); // **[Debug] Log Markdown Link ที่สร้าง**


        } else {
            formattedContact.push(trimmedEntry); // ถ้าไม่ Match Regex ให้ Push Entry เดิม (ที่ไม่ใช่ Markdown Link)
            console.log('[formatContactText] No Match - Pushed Entry:', trimmedEntry); // **[Debug] Log Entry ที่ไม่ Match**
        }
        console.log('[formatContactText] Formatted Contact Array:', formattedContact); // **[Debug] Log Array หลัง Push ในแต่ละ Loop**

    }

    const finalContactText = formattedContact.join('\n').trim();
    console.log('[formatContactText] Final Contact Text:', finalContactText);
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
            } else if (
                interaction.type === InteractionType.ModalSubmit &&
                interaction.customId === 'introduceModal'
            ) {
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

                const hobby = splitText(formatText(cleanedHobby), 50);
                const favorite = splitText(formatText(cleanedFavorite), 50);
                const contact = formatContactText(cleanedContact); // Use formatContactText to create hyperlinks

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
