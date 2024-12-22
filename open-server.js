const http = require('http');
const axios = require('axios');

// Discord Webhook URL
const webhookURL = 'https://discord.com/api/webhooks/1319911421395341372/WUzUkb70LSfgC9E523IHT11TVg1i9FkykCeyiBpnt5cRQq_KD9GxKMLTx2RfKRF11jKv';

// พอร์ตสำหรับเซิร์ฟเวอร์
const port = process.env.PORT || 8080;

// ฟังก์ชันส่งข้อความแจ้งเตือนผ่าน Discord Webhook
async function sendAlert(message) {
  try {
    await axios.post(webhookURL, { content: message });
    console.log('✅ Alert sent:', message);
  } catch (error) {
    console.error('❌ Failed to send alert:', error.message);
  }
}

// สร้างเซิร์ฟเวอร์ HTTP
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("I'm alive");
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// ตรวจสอบสถานะของเซิร์ฟเวอร์เอง
async function checkServerStatus() {
  try {
    const response = await axios.get(`http://localhost:${port}`);
    if (response.status === 200) {
      console.log('✅ Server is running.');
    }
  } catch (error) {
    console.error('❌ Server is down:', error.message);
    sendAlert(`❌ Server is down: ${error.message}`);
  }
}

// เริ่มเซิร์ฟเวอร์และตั้งค่าตรวจสอบสถานะ
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  // ตรวจสอบสถานะทุกๆ 5 นาที
  setInterval(checkServerStatus, 5 * 60 * 1000);
});
