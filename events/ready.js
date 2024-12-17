const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity(`/commandList\n [Bot version: 1.0.0]`, { type: ActivityType.Watching });
		client.user.setStatus('ActivityType.Online');
	}
};
