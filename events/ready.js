const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        // ตั้งค่า Activity (กิจกรรม)
        client.user.setActivity('/commandList\n[Bot version: 1.0.0]', { type: ActivityType.Watching });

        // ตั้งค่า status เป็น online
        client.user.setStatus('online');
    }
};
