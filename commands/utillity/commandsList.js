const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commands-list')
    .setDescription('Displays a list of all available commands and their descriptions.'),

  async execute(interaction) {
    // Get all commands from client.commands
    const commands = interaction.client.commands;
    
    // Convert commands to an array and sort alphabetically by command name
    const sortedCommands = Array.from(commands.values()).sort((a, b) => a.data.name.localeCompare(b.data.name));
    
    // Create Embed
    const embed = new EmbedBuilder()
      .setTitle('Commands List')
      .setDescription(`This bot has ${sortedCommands.length} commands which will show below.`) // Updated description
      .setColor('#00FF00') // Embed color
      .setTimestamp();
    
    // Add sorted commands to Embed
    sortedCommands.forEach(command => {
      embed.addFields({
        name: `/${command.data.name}`,
        value: command.data.description || 'No description available', // Using description from SlashCommandBuilder
        inline: false,
      });
    });

    // Send Embed to the channel
    await interaction.reply({ embeds: [embed] });
  },
};
