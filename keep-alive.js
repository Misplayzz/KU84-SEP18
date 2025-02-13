const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;
const KEEP_ALIVE_URL = 'https://ku84-sep18.onrender.com';

// Route สำหรับ Render ให้รู้ว่าเซิร์ฟเวอร์ทำงาน
app.get('/', (req, res) => {
  res.send("I'm alive");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Ping ตัวเองทุก 14 นาที (แต่ Render อาจยังปิดอยู่ดี)
setInterval(async () => {
  try {
    await axios.get(KEEP_ALIVE_URL);
    console.log('Pinged server successfully');
  } catch (error) {
    console.error('Error pinging server:', error.message);
  }
}, 14 * 60 * 1000);
