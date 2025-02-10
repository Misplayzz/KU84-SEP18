const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),

    async execute(interaction) {
        // Create an embed with detailed server information
        const serverEmbed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name} Server Info`)
            .setColor('#00FF00')
            .addFields(
                { name: 'Server Name', value: interaction.guild.name, inline: true },
                { name: 'Total Members', value: `${interaction.guild.memberCount}`, inline: true },
                { name: 'Owner', value: `<@${interaction.guild.ownerId}>`, inline: true },
                { name: 'Created On', value: interaction.guild.createdAt.toDateString(), inline: true },
                { name: 'Region', value: interaction.guild.preferredLocale, inline: true }
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Server Info' })
            .setTimestamp();

        // Send the embed
        await interaction.reply({ embeds: [serverEmbed] });
    },
};
