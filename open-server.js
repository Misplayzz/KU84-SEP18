const axios = require('axios');

const webhookURL = 'https://discord.com/api/webhooks/1319911421395341372/WUzUkb70LSfgC9E523IHT11TVg1i9FkykCeyiBpnt5cRQq_KD9GxKMLTx2RfKRF11jKv'; // ใส่ URL Webhook ของคุณ
const websiteURL = 'https://ku84-sep18.onrender.com';

// ฟังก์ชันสำหรับส่งข้อความแจ้งเตือนผ่าน Webhook
async function sendAlert(message) {
  try {
    await axios.post(webhookURL, { content: message });
    console.log('Alert sent:', message);
  } catch (error) {
    console.error('Failed to send alert:', error.message);
  }
}

// ฟังก์ชันสำหรับตรวจสอบเว็บไซต์
async function checkWebsite() {
  try {
    const response = await axios.get(websiteURL);
    if (response.status === 200) {
      console.log('Website is up!');
    } else {
      console.warn('Unexpected response status:', response.status);
      sendAlert(`⚠️ Website is up but returned status ${response.status}`);
    }
  } catch (error) {
    console.error('Website is down:', error.message);
    sendAlert(`❌ Website is down: ${error.message}`);
  }
}

// ตั้งเวลาตรวจสอบทุก 5 นาที
setInterval(checkWebsite, 5 * 60 * 1000);

// เรียกตรวจสอบครั้งแรกเมื่อเริ่มโค้ด
checkWebsite();

