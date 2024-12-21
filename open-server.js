const http = require('http');
const axios = require('axios');

// สร้างเซิร์ฟเวอร์
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.write("I'm alive");
  res.end();
}).listen(port, () => {
  console.log(`Keep-alive server is running on port ${port}`);
});

// ฟังก์ชันแจ้งเตือนเมื่อเซิร์ฟเวอร์ล้มเหลว
async function sendDiscordAlert() {
  const webhookURL = 'https://discord.com/api/webhooks/1319911421395341372/WUzUkb70LSfgC9E523IHT11TVg1i9FkykCeyiBpnt5cRQq_KD9GxKMLTx2RfKRF11jKv'; // แทนด้วย Webhook URL ของคุณ
  try {
    await axios.post(webhookURL, {
      content: "🚨 The server is down!",
    });
    console.log('Discord alert sent!');
  } catch (err) {
    console.error('Failed to send Discord alert:', err.message);
  }
}

// ตรวจสอบเซิร์ฟเวอร์ตัวเองทุก 5 นาที
setInterval(() => {
  axios.get(`http://localhost:${port}`)
    .then(() => {
      console.log("Self-check passed: Server is running.");
    })
    .catch(async (err) => {
      console.error("Self-check failed: Server might be down.", err.message);
      await sendDiscordAlert(); // แจ้งเตือนเมื่อเซิร์ฟเวอร์ล้มเหลว
    });
}, 5 * 60 * 1000); // ทุก 5 นาที
