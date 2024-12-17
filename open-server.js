const http = require('http');
const axios = require('axios');

// สร้าง HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end("I'm alive!");  // ตอบกลับข้อความเมื่อเปิดลิงก์ '/'
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

// กำหนดให้เซิร์ฟเวอร์ฟังที่พอร์ต 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// ใช้ axios เพื่อส่งคำขอ GET ไปที่เซิร์ฟเวอร์เองเพื่อทำให้มันทำงานตลอดเวลา
setInterval(() => {
  axios.get(`http://localhost:${PORT}`)
    .then(response => {
      console.log('Keep-alive successful:', response.data);
    })
    .catch(err => {
      console.error('Keep-alive failed:', err.message);
    });
}, 5 * 60 * 1000);  // ทำให้เชื่อมต่อทุกๆ 5 นาที
