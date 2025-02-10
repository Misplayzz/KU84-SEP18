const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.'),

    async execute(interaction) {
        // Create an embed with detailed user information
        const userEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Info`)
            .setColor('#3498db')
            .addFields(
                { name: 'Username', value: interaction.user.username, inline: true },
                { name: 'User ID', value: interaction.user.id, inline: true },
                { name: 'Joined Server On', value: interaction.member.joinedAt.toDateString(), inline: false },
                { name: 'Account Created On', value: interaction.user.createdAt.toDateString(), inline: false }
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'User Info' })
            .setTimestamp();

        // Send the embed with user information
        await interaction.reply({ embeds: [userEmbed] });
    },
};
