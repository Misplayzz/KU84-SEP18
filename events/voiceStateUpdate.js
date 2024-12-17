const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const enableConfig = JSON.parse(fs.readFileSync('enable.json', 'utf8'));

        if (!enableConfig.enabled) return;

        const user = newState.member.user;
        const username = user.username;
        const channelId = config.vcJMLNoti;

        const channel = newState.guild.channels.cache.get(channelId);
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
        }
            else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            // User moved from one voice channel to another
            embed = new EmbedBuilder()
                .setTitle('User moved!')
                .setDescription(`**UserName**: ${username} has moved from ${oldState.channel.name} to ${newState.channel.name}.`)
                .setColor('#FFD700')
                .setTimestamp();
        }

        else if (oldState.channelId && !newState.channelId) {
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
