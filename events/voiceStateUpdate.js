const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');

let enableConfig = {};
try {
    enableConfig = JSON.parse(fs.readFileSync('vctoggle.json', 'utf8'));
} catch (error) {
    console.error('Error reading enable.json:', error);
}

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        if (!enableConfig.enabled) return;

        const user = newState.member?.user;
        if (!user) return; // ตรวจสอบว่า user มีข้อมูล

        const username = user.username;
        const channelId = config.vcJMLNoti;

        const channel = newState.guild?.channels.cache.get(channelId);
        if (!channel) {
            console.log('Target channel not found.');
            return;
        }

        let embed;

        if (!oldState.channelId && newState.channelId) {
            // User joined a voice channel
            embed = new EmbedBuilder()
                .setTitle('User joined!')
                .setDescription(`**UserName**: ${username} has joined ${newState.channel.name}.`)
                .setColor('#00FF00')
                .setTimestamp();
        } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            // User moved from one voice channel to another
            embed = new EmbedBuilder()
                .setTitle('User moved!')
                .setDescription(`**UserName**: ${username} has moved from ${oldState.channel.name} to ${newState.channel.name}.`)
                .setColor('#FFD700')
                .setTimestamp();
        } else if (oldState.channelId && !newState.channelId) {
            // User left a voice channel
            embed = new EmbedBuilder()
                .setTitle('User left!')
                .setDescription(`**UserName**: ${username} has left from ${oldState.channel.name}.`)
                .setColor('#FF0000')
                .setTimestamp();
        }

        if (embed) {
            await channel.send({ embeds: [embed] });
        }
    },
};
