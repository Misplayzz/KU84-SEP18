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
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    }
                }
            }

            // Handle modal submissions
            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'introduceModal') {
                    // Validate interaction context
                    if (!interaction.guild || !interaction.member) {
                        console.error('Interaction is not from a guild or lacks member data.');
                        await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
                        return;
                    }

                    const nickname = interaction.fields.getTextInputValue('nicknameInput');
                    const hobby = interaction.fields.getTextInputValue('hobbyInput');
                    const favorite = interaction.fields.getTextInputValue('favoriteInput');

                    const taggedUser = interaction.user.toString();
                    const messageContent = `${taggedUser}`;
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
                        await targetChannel.send({ content: messageContent, embeds: [indEmbed] });

                        // Add new role and remove old role
                        const member = await interaction.guild.members.fetch(interaction.user.id);
                        const newRole = interaction.guild.roles.cache.get(config.indRole);
                        const oldRole = interaction.guild.roles.cache.get(config.notIndRole);

                        // Ensure the bot has permission to manage roles
                        const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
                        if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                            console.error('Bot does not have MANAGE_ROLES permission.');
                            await interaction.reply({ content: 'I do not have permission to manage roles.', ephemeral: true });
                            return;
                        }

                        // Check if the bot's role is higher than the roles it is trying to manage
                        if (newRole && oldRole) {
                            if (botMember.roles.highest.position <= newRole.position) {
                                console.error('Bot cannot manage the new role because it is higher in hierarchy.');
                                await interaction.reply({ content: 'I cannot manage the roles due to hierarchy issues.', ephemeral: true });
                                return;
                            }

                            if (botMember.roles.highest.position <= oldRole.position) {
                                console.error('Bot cannot manage the old role because it is higher in hierarchy.');
                                await interaction.reply({ content: 'I cannot manage the roles due to hierarchy issues.', ephemeral: true });
                                return;
                            }
                        }

                        console.log(`Removing role ${oldRole.name} from ${member.user.tag} and adding role ${newRole.name}`);
                        if (newRole) await member.roles.add(newRole);
                        if (oldRole) await member.roles.remove(oldRole);
                    } else {
                        console.log('Target channel not found.');
                    }

                    // Update nickname
                    try {
                        await interaction.guild.members.cache
                            .get(interaction.user.id)
                            .setNickname(`AKA: ${nickname}`);
                    } catch (error) {
                        console.error('Error setting nickname:', error);
                        await interaction.reply({ content: 'Unable to set your nickname due to permission issues.', ephemeral: true });
                        return;
                    }

                    // Reply to close the modal
                    await interaction.reply({ content: 'Your introduction has been submitted successfully!😊', ephemeral: true });
                }
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'An unexpected error occurred.', ephemeral: true });
            }
        }
    },
};
