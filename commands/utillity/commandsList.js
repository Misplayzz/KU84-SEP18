const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commands-list')
    .setDescription('Displays a list of all available commands and their descriptions.'),

  async execute(interaction) {
    // Get all commands from client.commands
    const commands = interaction.client.commands;
    
    // Convert commands to an array and sort alphabetically, placing [Owner-Only] commands at the bottom
    const sortedCommands = Array.from(commands.values()).sort((a, b) => {
      const isAOwnerOnly = a.data.description.includes('[Owner-Only]');
      const isBOwnerOnly = b.data.description.includes('[Owner-Only]');
      
      if (isAOwnerOnly && !isBOwnerOnly) return 1; // Move a below b
      if (!isAOwnerOnly && isBOwnerOnly) return -1; // Move b below a
      return a.data.name.localeCompare(b.data.name); // Sort alphabetically otherwise
    });

    // Create Embed
    const embed = new EmbedBuilder()
      .setTitle('Commands List')
      .setDescription(`This bot has ${sortedCommands.length} commands which will show below.`)
      .setColor('#00FF00')
      .setTimestamp();

    // Add sorted commands to Embed
    sortedCommands.forEach(command => {
      embed.addFields({
        name: `/${command.data.name}`,
        value: command.data.description || 'No description available',
        inline: false,
      });
    });

    // Send Embed to the channel
    await interaction.reply({ embeds: [embed] });
  },
};
