const axios = require('axios');
const apiKey = process.env.APIKEY;

async function getVideoInfo(videoId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;
    
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching video information:', error.response.data);
        throw new Error('Unable to fetch video information.');
    }
}

module.exports = { getVideoInfo };
