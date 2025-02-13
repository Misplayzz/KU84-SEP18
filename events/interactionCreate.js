const { Events, EmbedBuilder, PermissionsBitField, InteractionType } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.InteractionCreate,
  async execute(client, interaction) {
    try {
      // Log interaction details for debugging
      console.log(`[InteractionCreate] Received interaction with ID: ${interaction.id} and type: ${interaction.type}`);
      console.log('[InteractionCreate] Interaction details:',
      {
        id: interaction?.id,
        type: interaction?.type,
        commandName: interaction?.commandName || 'N/A',
      });

      // Check if the interaction is a slash command (ApplicationCommand)
      if (interaction.type === InteractionType.ApplicationCommand) {
        console.log(`[InteractionCreate] Processing command: ${interaction.commandName}`);
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
          console.error(`No command matching ${interaction.commandName} was found.`);
          return;
        }

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error('Error executing command:', error,
          {
            id: interaction.id,
            type: interaction.type,
            commandName: interaction.commandName,
          });
          const response = {
            content: 'There was an error executing this command!',
          };
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response);
          } else {
            await interaction.reply(response);
          }
        }
      }

      // Check if the interaction is a modal submit with customId 'introduceModal'
      else if (
        interaction.type === InteractionType.ModalSubmit &&
        interaction.customId === 'introduceModal'
      ) {
        console.log('[InteractionCreate] Processing modal submission: introduceModal');
        const { guild, user, member } = interaction;

        if (!guild || !member) {
          console.error('Guild or member not found in modal interaction.', { id: interaction.id });
          return await interaction.reply({
            content: 'This command can only be used in a server.',
            flags: 64,
          });
        }

        // Extract and format form data
        let nickname = formatNickname(interaction.fields.getTextInputValue('nicknameInput'));
        const hobby = formatText(interaction.fields.getTextInputValue('hobbyInput'));
        const favorite = formatText(interaction.fields.getTextInputValue('favoriteInput'));
        const contact = formatText(interaction.fields.getTextInputValue('contactInput'));

        // Create an embed with the introduction
        const embed = createEmbed(user, nickname, hobby, favorite, contact);
        const targetChannel = guild.channels.cache.get(config.indEmbedChannel);
        if (targetChannel) {
          await targetChannel.send({ content: `${user}`, embeds: [embed] });
        }

        // Manage roles and nickname update
        await manageRoles(guild, member, nickname);
        await setNickname(member, nickname);

        await interaction.reply({
          content: 'Your introduction has been submitted successfully! 😊',
          flags: 64,
        });
      }
    } catch (error) {
      console.error('Unhandled error in interactionCreate:', error, 
      {
        id: interaction.id,
        type: interaction.type,
        commandName: interaction.commandName || 'N/A',
      });
      if (!interaction.replied) {
        await interaction.reply({
          content: 'An unexpected error occurred.',
          flags: 64,
        });
      }
    }
  },
};

// Helper function to format the nickname (capitalize first letter)
function formatNickname(nickname) {
  return nickname && nickname.length > 0
    ? nickname.charAt(0).toUpperCase() + nickname.slice(1)
    : '';
}

const splitText = (text, maxLine = 50) => {
    const words = text.split(/\s*,\s*/); // ใช้ RegEx แยกทั้ง , และ , 
    let result = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine}, ${words[i]}` : words[i];

        if (testLine.length > maxLine) {
            result.push(currentLine.trim());  // หากความยาวเกิน 50 ตัว ก็เพิ่มบรรทัดใหม่
            currentLine = words[i];  // เริ่มต้นบรรทัดใหม่
        } else {
            currentLine = testLine;  // ต่อบรรทัดปัจจุบัน
        }
    }

    if (currentLine) result.push(currentLine.trim());  // เพิ่มบรรทัดสุดท้าย
    return result.join('\n');  // แสดงผลลัพธ์ที่ถูกแบ่งบรรทัด
};

// Helper function to create the introduction embed
function createEmbed(user, nickname, hobby, favorite, contact) {
  const embed = new EmbedBuilder()
    .setTitle('Introduction has been confirmed.✅')
    .setColor('#00FFFF')
    .addFields(
      { name: 'Nickname', value: nickname },
      { name: 'Hobby', value: hobby },
      { name: 'Favorite', value: favorite }
    )
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  if (contact) {
    embed.addFields({ name: 'Contact', value: contact });
  }

  return embed;
}

// Helper function to manage roles
async function manageRoles(guild, member, nickname) {
  const newRole = guild.roles.cache.get(config.indRole);
  const oldRole = guild.roles.cache.get(config.notIndRole);
  const botMember = await guild.members.fetch(guild.client.user.id);

  if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
    console.error('Bot lacks MANAGE_ROLES permission.');
    throw new Error('I do not have permission to manage roles.');
  }

  if (newRole && oldRole) {
    if (botMember.roles.highest.position <= Math.max(newRole.position, oldRole.position)) {
      console.error('Bot lacks sufficient role position.');
      throw new Error('I cannot manage roles due to position issues.');
    }
    await member.roles.add(newRole).catch(console.error);
    await member.roles.remove(oldRole).catch(console.error);
  }
}

// Helper function to set the nickname
async function setNickname(member, nickname) {
  try {
    await member.setNickname(nickname);
  } catch (error) {
    console.error('Error setting nickname:', error);
    throw new Error('Unable to set your nickname due to permission issues.');
  }
}
