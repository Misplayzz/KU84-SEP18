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
                } else {
                    nickname = "No nickname provided"; // Fallback if nickname is empty
                }

                // Fallback values if fields are empty
                const hobbyValue = hobby || "No hobby provided";
                const favoriteValue = favorite || "No favorite provided";
                
                const embed = new EmbedBuilder()
                    .setTitle('Introduction has been confirmed.✅')
                    .setColor('#00FFFF')
                    .addFields(
                        { name: 'Nickname', value: nickname },
                        { name: 'Hobby', value: hobbyValue },
                        { name: 'Favorite', value: favoriteValue }
                    )
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                // Add Contact field only if it's not empty
                if (contact) {
                    const contactValue = contact || "No contact provided";
                    embed.addFields({ name: 'Contact', value: contactValue });
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
                        console.error('Bot lacks sufficient role hierarchy.');
                        return interaction.reply({ content: 'I cannot manage roles due to hierarchy issues.', flags: 64 });
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
