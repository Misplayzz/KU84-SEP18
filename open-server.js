const http = require('http');
const axios = require('axios');

const port = process.env.PORT || 8080;
const websiteURL = 'https://ku84-sep18.onrender.com';
const webhookURL = 'https://discord.com/api/webhooks/1319911421395341372/WUzUkb70LSfgC9E523IHT11TVg1i9FkykCeyiBpnt5cRQq_KD9GxKMLTx2RfKRF11jKv'; // เปลี่ยนเป็น Webhook ของคุณ

// สร้างเซิร์ฟเวอร์ HTTP
http.createServer((req, res) => {
  if (req.url === '/') {
    res.write("I'm alive!");
    res.end();
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});

// ฟังก์ชันสำหรับส่งแจ้งเตือนผ่าน Discord Webhook
async function sendAlert(message) {
  try {
    await axios.post(webhookURL, { content: message });
    console.log('✅ Alert sent:', message);
  } catch (error) {
    console.error('❌ Failed to send alert:', error.message);
  }
}

// ฟังก์ชันสำหรับตรวจสอบเว็บไซต์
async function checkWebsite() {
  try {
    const response = await axios.get(websiteURL);
    if (response.status === 200) {
      console.log('✅ Website is up!');
    } else {
      console.warn('⚠️ Unexpected response status:', response.status);
      sendAlert(`⚠️ Website is up but returned status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Website is down:', error.message);
    sendAlert(`❌ Website is down: ${error.message}`);
  }
}

// ตรวจสอบเว็บไซต์ทุก 5 นาที
setInterval(checkWebsite, 5 * 60 * 1000);
checkWebsite();
