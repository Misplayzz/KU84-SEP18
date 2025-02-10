const { Events, EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // Handle chat input commands
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);

                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ 
                        content: 'There was an error while executing this command!', 
                        flags: 64
                    });
                }
            }

            // Handle modal submissions
            if (interaction.isModalSubmit() && interaction.customId === 'introduceModal') {
                if (!interaction.guild || !interaction.member) {
                    console.error('Interaction is not from a guild or lacks member data.');
                    await interaction.reply({ 
                        content: 'This command can only be used in a server.', 
                        flags: 64
                    });
                    return;
                }

                const nickname = interaction.fields.getTextInputValue('nicknameInput');
                const hobby = interaction.fields.getTextInputValue('hobbyInput');
                const favorite = interaction.fields.getTextInputValue('favoriteInput');

                const taggedUser = interaction.user.toString();
                const indEmbed = new EmbedBuilder()
                    .setTitle('Introduction has been confirmed.✅')
                    .setColor('#00FFFF')
                    .addFields(
                        { name: 'Nickname', value: nickname },
                        { name: 'Hobby', value: hobby },
                        { name: 'Favorite', value: favorite }
                    )
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                const targetChannel = interaction.guild.channels.cache.get(config.indEmbedChannel);
                if (targetChannel) {
                    await targetChannel.send({ content: taggedUser, embeds: [indEmbed] });

                    // Fetch member and roles
                    const member = interaction.member;
                    const newRole = interaction.guild.roles.cache.get(config.indRole);
                    const oldRole = interaction.guild.roles.cache.get(config.notIndRole);

                    // Ensure the bot has permission to manage roles
                    const botMember = await interaction.guild.members.fetchMe();
                    if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                        console.error('Bot does not have MANAGE_ROLES permission.');
                        await interaction.reply({ 
                            content: 'I do not have permission to manage roles.', 
                            flags: 64
                        });
                        return;
                    }

                    // Check if the bot's role is higher than the roles it is trying to manage
                    if (newRole && botMember.roles.highest.position <= newRole.position) {
                        console.error('Bot cannot manage the new role due to hierarchy issues.');
                        await interaction.reply({ 
                            content: 'I cannot manage roles due to hierarchy restrictions.', 
                            flags: 64
                        });
                        return;
                    }

                    if (oldRole && botMember.roles.highest.position <= oldRole.position) {
                        console.error('Bot cannot manage the old role due to hierarchy issues.');
                        await interaction.reply({ 
                            content: 'I cannot manage roles due to hierarchy restrictions.', 
                            flags: 64
                        });
                        return;
                    }

                    console.log(`Updating roles: Removing ${oldRole?.name} and adding ${newRole?.name} for ${member.user.tag}`);
                    if (newRole) await member.roles.add(newRole).catch(console.error);
                    if (oldRole) await member.roles.remove(oldRole).catch(console.error);
                } else {
                    console.log('Target channel not found.');
                }

                // Update nickname
                try {
                    await member.setNickname(`AKA: ${nickname}`);
                } catch (error) {
                    console.error('Error setting nickname:', error);
                    await interaction.reply({ 
                        content: 'Unable to set your nickname due to permission issues.', 
                        flags: 64
                    });
                    return;
                }

                // Reply to close the modal
                await interaction.reply({ 
                    content: 'Your introduction has been submitted successfully!😊', 
                    flags: 64
                });
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: 'An unexpected error occurred.', 
                    flags: 64 
                });
            }
        }
    },
};
