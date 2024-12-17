// spotify_access.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const spotify_client_id = process.env.SPOTIFYCLIENTID;
const spotify_client_secret = process.env.SPOTIFYCLIENTSECRET;

let accessToken = '';
let tokenExpiryTime = 0;

async function getAccessToken() {
    try {
        const currentTime = Date.now();
        // ถ้า access token ยังไม่หมดอายุ ให้ใช้ token เดิม
        if (accessToken && tokenExpiryTime > currentTime) {
            return accessToken;
        }

        if (!spotify_client_id || !spotify_client_secret) {
            throw new Error('Spotify client ID or secret is not set');
        }

        const base64EncodedCredentials = Buffer.from(`${spotify_client_id}:${spotify_client_secret}`).toString('base64');
        const response = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'client_credentials'
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${base64EncodedCredentials}`
                }
            });

        // เก็บ access token และเวลา expire
        accessToken = response.data.access_token;
        tokenExpiryTime = Date.now() + (response.data.expires_in * 1000); // expires_in in seconds
        return accessToken;
    } catch (error) {
        console.error('Error fetching Spotify Access Token:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching Spotify Access Token');
    }
}

module.exports = getAccessToken;
