const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const STORAGE_ZONE = process.env.REACT_APP_BUNNY_STORAGE_ZONE;

const getVideoUrls = async () => {
    try {
        const response = await axios.get(`https://api.bunnycdn.com/storage/video/${STORAGE_ZONE}`, {
            headers: {
                'AccessKey': BUNNY_API_KEY
            }
        });

        const videos = response.data;
        videos.forEach(video => {
            console.log(`Video Name: ${video.Name}, URL: https://oculair.b-cdn.net/${video.Path}`);
        });
    } catch (error) {
        console.error('Error fetching video URLs:', error.message);
    }
};

getVideoUrls();
