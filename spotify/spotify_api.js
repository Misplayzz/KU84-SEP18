const axios = require('axios');
const getAccessToken = require('./spotify_access');

async function searchSong(query) {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const song = response.data.tracks.items[0];
    if (!song) return null;

    return {
      title: song.name,
      artist: song.artists.map(artist => artist.name).join(', '),
      link: song.external_urls.spotify,
      thumbnail: song.album.images[0]?.url || 'https://via.placeholder.com/150'
    };
  } catch (error) {
    console.error('Error searching for song:', error);
    return null;
  }
}

module.exports = searchSong;
