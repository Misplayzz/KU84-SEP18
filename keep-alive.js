const http = require('http');
const axios = require('axios');

const PORT = process.env.PORT || 8080;
const KEEP_ALIVE_URL = 'https://ku84-sep18.onrender.com';

// Create HTTP server to keep alive
http.createServer((_, res) => res.end("I'm alive")).listen(PORT, () => {
  console.log(`Keep-alive server running on port ${PORT}`);
});

// Ping the server every 5 minutes
setInterval(async () => {
  try {
    await axios.get(KEEP_ALIVE_URL);
    console.log('Pinged server successfully');
  } catch (error) {
    console.error('Error pinging server:', error.message);
  }
}, 14 * 60 * 1000);
