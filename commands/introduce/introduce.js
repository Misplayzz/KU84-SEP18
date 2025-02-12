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

            // ตรวจสอบว่าใช้คำสั่งในช่องที่ถูกต้องและมี Role หรือไม่
            if (channelId !== config.indChannel || !member.roles.cache.has(config.notIndRole)) {
                if (interaction.replied || interaction.deferred) return;
                return interaction.reply({
                    content: `You can only use this command in <#${config.indChannel}> and must have <@&${config.notIndRole}> role.`,
                    flags: 64, // ใช้ flags แทน ephemeral
                });
            }

            // เช็คว่ามีการตอบกลับหรือยัง
            if (interaction.replied || interaction.deferred) return;

            // สร้าง Modal
            const modal = new ModalBuilder()
                .setCustomId('introduceModal')
                .setTitle('Introduce Yourself');

            // กำหนดฟิลด์ข้อมูล
            const fields = [
                { id: 'nicknameInput', label: 'ชื่อเล่นของคุณชื่อว่าอะไร?', placeholder: '[ใส่ชื่อเล่น]', required: true },
                { id: 'hobbyInput', label: 'งานอดิเรกของคุณคืออะไร?', placeholder: '[เล่นเกม, ร้องเพลง, ฟังเพลง, ฯลฯ]', required: true },
                { id: 'favoriteInput', label: 'สิ่งที่คุณชอบคืออะไร?', placeholder: '[อาหาร, สิ่งของ, หรือบางสิ่งอย่างอื่น]', required: true },
                { id: 'contactInput', label: 'ช่องทางติดต่อ (Optional)', placeholder: '[IG, Facebook, and other platforms. (Pick the one you use the most!)]', required: false }
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
            if (!interaction.replied && !interaction.deferred) {
                await interaction.deferReply({ flags: 64 }); // ใช้ flags แทน ephemeral
                await interaction.editReply({ content: 'An unexpected error occurred. Please try again later.' });
            }
        }
    },
};
