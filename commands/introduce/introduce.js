const { SlashCommandBuilder } = require('@discordjs/builders');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('introduce')
        .setDescription('Allows a user to introduce themselves.'),

    async execute(interaction) {
        try {
            // Ensure member is fetched correctly from the guild
            const member = await interaction.guild.members.fetch(interaction.user.id);

            // Check if the command is used in the correct channel or if the user has the required role
            if (interaction.channelId !== config.indChannel || !member.roles.cache.has(config.notIndRole)) {
                return interaction.reply({
                    content: `You can only use this command in <#${config.indChannel}> and you must have the role <@&${config.notIndRole}>.`,
                    ephemeral: true,
                });
            }

            // Avoid duplicate replies
            if (interaction.replied || interaction.deferred) return;

            // Create the modal
            const modal = new ModalBuilder()
                .setCustomId('introduceModal')
                .setTitle('Send this message to introduce yourself.');

            // Create input fields
            const nicknameInput = new TextInputBuilder()
                .setCustomId('nicknameInput')
                .setLabel("ชื่อเล่นของคุณชื่อว่าอะไร?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('[ใส่ชื่อเล่น]')
                .setRequired(true);

            const hobbyInput = new TextInputBuilder()
                .setCustomId('hobbyInput')
                .setLabel("งานอดิเรกของคุณคืออะไร?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('[เล่นเกม, ร้องเพลง, ฟังเพลง, ฯลฯ]')
                .setRequired(true);

            const favoriteInput = new TextInputBuilder()
                .setCustomId('favoriteInput')
                .setLabel("สิ่งที่คุณชอบคืออะไร?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('[อาหาร, สิ่งของ, หรือบางสิ่งอย่างอื่น]')
                .setRequired(true);

            // Create action rows
            const firstActionRow = new ActionRowBuilder().addComponents(nicknameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(hobbyInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(favoriteInput);

            // Add components to modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            // Display the modal to the user
            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error executing introduce command:', error);
            return interaction.reply({
                content: 'An unexpected error occurred while processing your command. Please try again later.',
                ephemeral: true,
            });
        }
    },
};
