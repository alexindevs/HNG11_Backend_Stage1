import express, { Request, Response } from 'express';
import axios from 'axios';
import { getIpLocation } from 'ipapi-tools';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get('/api/hello', async (req: Request, res: Response) => {
  let visitorName = req.query.visitor_name as string || 'Guest';
  visitorName = visitorName.replace(/['"]+/g, '');
  const clientIp = req.ip;

  console.log(clientIp);

  if (!clientIp) {
    res.status(500).send('An error occurred while fetching data');
    return;
  }

  try {
    const locationResponse = await getIpLocation(clientIp);
    console.log(locationResponse);
    const { city } = locationResponse;
    
    const weatherDataUrl = 'http://api.weatherapi.com/v1';
    const weatherApiKey = process.env.WEATHER_API_KEY;
    const temperatureResponse = await axios.get(`${weatherDataUrl}/current.json?key=${weatherApiKey}&q=${city}`);
    const temperature = temperatureResponse.data.current.feelslike_c;

    res.status(200).json({
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celcius in ${city}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
