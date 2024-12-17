const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd, // ระบุชื่อ event
    async execute(member) {
        try {
            // ID ของ role ที่ต้องการให้ (แทนที่ด้วย Role ID จริง)
            const roleId = 'ROLE_ID_HERE';
            
            // ดึง role จากเซิร์ฟเวอร์
            const role = member.guild.roles.cache.get(roleId);
            
            if (!role) {
                console.error(`Role ID ${roleId} ไม่ถูกต้องหรือไม่มี role นี้ในเซิร์ฟเวอร์`);
                return;
            }

            // เพิ่ม role ให้ user
            await member.roles.add(role);
            console.log(`เพิ่ม role ${role.name} ให้กับ ${member.user.tag} สำเร็จ`);
        } catch (error) {
            console.error(`เกิดข้อผิดพลาดในการเพิ่ม role: ${error}`);
        }
    },
};
