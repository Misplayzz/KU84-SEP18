const axios = require('axios');

// URL ที่ต้องการ ping เพื่อให้เซิร์ฟเวอร์ไม่เข้าสู่โหมด idle
const KEEP_ALIVE_URL = 'https://ku84-sep18.onrender.com';

// Ping the server every 14 minutes
setInterval(async () => {
  try {
    await axios.get(KEEP_ALIVE_URL);
    console.log('Pinged server successfully');
  } catch (error) {
    console.error('Error pinging server:', error.message);
  }
}, 14 * 60 * 1000); // 14 นาทีในมิลลิวินาที
