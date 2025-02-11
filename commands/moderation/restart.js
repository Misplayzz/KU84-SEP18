const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');  // โหลด config.json ที่เก็บข้อมูลเจ้าของบอท

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the bot. [Owner-Only]'),

  async execute(interaction) {
    try {
      // ตรวจสอบว่า user ที่ใช้คำสั่งเป็นเจ้าของหรือไม่
      if (interaction.user.id !== config.ownerId) {
        await interaction.reply({
          content: `You aren't the owner. Only <@${config.ownerId}> can use this command.`,
          ephemeral: true // การตั้งค่านี้ทำให้ข้อความไม่สามารถตอบกลับได้ในช่องแชท
        });
        return;
      }

      // ถ้าเป็นเจ้าของบอท ให้หยุดการทำงานของบอท
      await interaction.reply('Bot is restarting...'); // ตอบกลับว่า bot กำลังหยุด

      console.log('Shutting down bot...');
      
      // หยุดการทำงานของบอท
      await interaction.client.destroy();

      // ออกจากโปรเซส (ทำให้บอทหยุดทำงาน)
      process.exit();
    } catch (error) {
      console.error('Error shutting down the bot:', error);
      await interaction.reply({ content: 'There was an error trying to shut down the bot.', ephemeral: true });
    }
  },
};