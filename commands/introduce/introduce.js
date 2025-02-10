const { SlashCommandBuilder } = require('@discordjs/builders');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('introduce')
        .setDescription('Allows a user to introduce themselves.'),

    async execute(interaction) {
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);

            // Check for correct channel and role
            if (interaction.channelId !== config.indChannel || !member.roles.cache.has(config.notIndRole)) {
                return interaction.reply({
                    content: `You can only use this command in the following channel: <#${config.indChannel}> and you must have the role <@&${config.notIndRole}>.`,
                    flags: 64, // used flags instead of ephemeral
                });
            }

            // Helper function to create text input fields
            const createTextInput = (id, label, placeholder) => 
                new TextInputBuilder()
                    .setCustomId(id)
                    .setLabel(label)
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder(placeholder)
                    .setRequired(true);

            // Create the modal
            const modal = new ModalBuilder()
                .setCustomId('introduceModal')
                .setTitle('Send this message to introduce yourself.')
                .addComponents(
                    new ActionRowBuilder().addComponents(createTextInput('nicknameInput', "ชื่อเล่นของคุณชื่อว่าอะไร?", '[ใส่ชื่อเล่น]')),
                    new ActionRowBuilder().addComponents(createTextInput('hobbyInput', "งานอดิเรกของคุณคืออะไร?", '[เล่นเกม, ร้องเพลง, ฟังเพลง, ฯลฯ]')),
                    new ActionRowBuilder().addComponents(createTextInput('favoriteInput', "สิ่งที่คุณชอบคืออะไร?", '[อาหาร, สิ่งของ, หรือบางสิ่งอย่างอื่น]'))
                );

            // Display the modal
            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error executing introduce command:', error);
            return interaction.reply({
                content: 'An unexpected error occurred while processing your command. Please try again later.',
                flags: 64, // ใช้ flags แทน ephemeral
            });
        }
    },
};
