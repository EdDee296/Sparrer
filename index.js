require('dotenv').config();
const PORT = 8000;
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send(process.env.API_KEY);
});

app.get('/api/', async (req, res) => {
    // Extract lat and lon from the query parameters
    const { lat, lon } = req.query;

    try {
        // Use axios to make the request to the Geoapify API
        const response = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${process.env.API_KEY}`);
        const result = response.data;
        const city = result.features[0].properties.city;
        const state = result.features[0].properties.state;
        const country = result.features[0].properties.country;
        res.json({ city, state, country });
    } catch (error) {
        console.error('Error fetching Geoapify API:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});