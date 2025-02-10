const http = require('http');
const port = process.env.PORT || 8080;

// ฟังก์ชันสำหรับสร้างเซิร์ฟเวอร์
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("I'm alive");
});

// ฟังก์ชันปิงตัวเองทุกๆ 5 นาทีเพื่อไม่ให้เซิร์ฟเวอร์หยุด
const pingServer = () => {
  setInterval(() => {
    http.get(`http://localhost:${port}`, (res) => {
      console.log('Pinged server successfully');
    }).on('error', (e) => {
      console.error(`Error pinging server: ${e.message}`);
    });
  }, 5 * 60 * 1000); // 5 นาที
};

// เริ่มต้นเซิร์ฟเวอร์
server.listen(port, () => {
  console.log(`Keep-alive server running on port ${port}`);
  pingServer(); // เรียกใช้ฟังก์ชันปิงเซิร์ฟเวอร์
});
