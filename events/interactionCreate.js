const { Events, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);
                
                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    const response = { content: 'There was an error executing this command!', ephemeral: true };
                    interaction.replied || interaction.deferred ? await interaction.followUp(response) : await interaction.reply(response);
                }
            }

            if (interaction.isModalSubmit() && interaction.customId === 'introduceModal') {
                const { guild, user, member } = interaction;
                if (!guild || !member) return interaction.reply({ content: 'This command can only be used in a server.', flags: 64 });

                // Extract form data
                let nickname = interaction.fields.getTextInputValue('nicknameInput');
                const hobby = interaction.fields.getTextInputValue('hobbyInput');
                const favorite = interaction.fields.getTextInputValue('favoriteInput');
                const contact = interaction.fields.getTextInputValue('contactInput');

                // Change first letter of nickname to uppercase if it's lowercase
                if (nickname && nickname.length > 0) {
                    nickname = nickname.charAt(0).toUpperCase() + nickname.slice(1);
                }

                // Function to split text while ensuring every line does not exceed maxLine
                const splitText = (text, maxLine = 50) => {
                    const words = text.split(', ');
                    let result = [];
                    let currentLine = '';

                    for (let i = 0; i < words.length; i++) {
                        const testLine = currentLine ? `${currentLine}, ${words[i]}` : words[i];

                        if (testLine.length > maxLine) {
                            result.push(currentLine.trim());
                            currentLine = words[i];
                        } else {
                            currentLine = testLine;
                        }
                    }

                    if (currentLine) result.push(currentLine.trim());
                    return result.join('\n');
                };

                // Format fields with line breaks
                const formattedHobby = hobby && hobby.length > 0 ? splitText(hobby, 50) : '';
                const formattedFavorite = favorite && favorite.length > 0 ? splitText(favorite, 50) : '';
                const formattedContact = contact && contact.trim().length > 0 ? splitText(contact, 50) : null;

                // Create Embed
                const embed = new EmbedBuilder()
                    .setTitle('Introduction has been confirmed.✅')
                    .setColor('#00FFFF')
                    .addFields(
                        { name: 'Nickname', value: nickname },
                        { name: 'Hobby', value: formattedHobby },
                        { name: 'Favorite', value: formattedFavorite }
                    )
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                // ถ้า contact ไม่ว่าง ให้เพิ่มเข้าไป
                if (formattedContact) {
                    embed.addFields({ name: 'Contact', value: formattedContact });
                }

                const targetChannel = guild.channels.cache.get(config.indEmbedChannel);
                if (targetChannel) await targetChannel.send({ content: `${user}`, embeds: [embed] });

                // Role management
                const newRole = guild.roles.cache.get(config.indRole);
                const oldRole = guild.roles.cache.get(config.notIndRole);
                const botMember = await guild.members.fetch(interaction.client.user.id);

                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    console.error('Bot lacks MANAGE_ROLES permission.');
                    return interaction.reply({ content: 'I do not have permission to manage roles.', flags: 64 });
                }

                if (newRole && oldRole) {
                    if (botMember.roles.highest.position <= Math.max(newRole.position, oldRole.position)) {
                        console.error('Bot lacks sufficient role position.');
                        return interaction.reply({ content: 'I cannot manage roles due to position issues.', flags: 64 });
                    }

                    await member.roles.add(newRole).catch(console.error);
                    await member.roles.remove(oldRole).catch(console.error);
                }

                // Set nickname
                try {
                    await member.setNickname(`AKA: ${nickname}`);
                } catch (error) {
                    console.error('Error setting nickname:', error);
                    return interaction.reply({ content: 'Unable to set your nickname due to permission issues.', flags: 64 });
                }

                await interaction.reply({ content: 'Your introduction has been submitted successfully! 😊', flags: 64 });
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (!interaction.replied) await interaction.reply({ content: 'An unexpected error occurred.', flags: 64 });
        }
    },
};
