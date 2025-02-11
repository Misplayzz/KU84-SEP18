const { SlashCommandBuilder } = require('@discordjs/builders');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('introduce')
        .setDescription('Allows a user to introduce themselves.'),

    async execute(interaction) {
        try {
            const { guild, user, channelId } = interaction;
            const member = await guild.members.fetch(user.id);

            // Check if the command is used in the correct channel and the user has the required role
            if (channelId !== config.indChannel || !member.roles.cache.has(config.notIndRole)) {
                return interaction.reply({
                    content: `You can only use this command in <#${config.indChannel}> and must have <@&${config.notIndRole}> role.`,
                    ephemeral: true,
                });
            }

            // Avoid duplicate replies
            if (interaction.replied || interaction.deferred) return;

            // Create the modal
            const modal = new ModalBuilder()
                .setCustomId('introduceModal')
                .setTitle('Introduce Yourself');

            // Create input fields
            const fields = [
                { id: 'nicknameInput', label: 'ชื่อเล่นของคุณชื่อว่าอะไร?', placeholder: '[ใส่ชื่อเล่น]', required: true },
                { id: 'hobbyInput', label: 'งานอดิเรกของคุณคืออะไร?', placeholder: '[เล่นเกม, ร้องเพลง, ฟังเพลง, ฯลฯ]', required: true },
                { id: 'favoriteInput', label: 'สิ่งที่คุณชอบคืออะไร?', placeholder: '[อาหาร, สิ่งของ, หรือบางสิ่งอย่างอื่น]', required: true }
            ].map(({ id, label, placeholder, required }) =>
                new TextInputBuilder()
                    .setCustomId(id)
                    .setLabel(label)
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder(placeholder)
                    .setRequired(required)
            );

            modal.addComponents(...fields.map(input => new ActionRowBuilder().addComponents(input)));

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error executing introduce command:', error);
            return interaction.reply({
                content: 'An unexpected error occurred. Please try again later.',
                flags: 64,
            });
        }
    },
};
