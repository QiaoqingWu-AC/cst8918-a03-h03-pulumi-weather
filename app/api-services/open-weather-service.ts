import { redis } from '../data-access/redis-connection'

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const TEN_MINUTES = 1000 * 60 * 10; // Expiry time in milliseconds

interface FetchWeatherDataParams {
  lat: number;
  lon: number;
  units: 'standard' | 'metric' | 'imperial';
}

export async function fetchWeatherData({
  lat,
  lon,
  units,
}: FetchWeatherDataParams) {
  if (!API_KEY) {
    throw new Error('API key is missing. Set WEATHER_API_KEY in your environment.');
  }

  const queryString = `lat=${lat}&lon=${lon}&units=${units}`;
  
  // Check the Redis cache for the data
  const cacheEntry = await redis.get(queryString);
  if (cacheEntry) {
    console.log('Cache hit:', queryString);
    return JSON.parse(cacheEntry); // Return cached data if available
  }
  
  // If not in cache, fetch data from the API
  console.log('Cache miss:', queryString);
  const response = await fetch(`${BASE_URL}?${queryString}&appid=${API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.statusText}`);
  }

  const data = await response.text(); // Avoid unnecessary JSON.stringify later
  
  // Store the data in Redis with a TTL
  await redis.set(queryString, data, { PX: TEN_MINUTES });
  
  return JSON.parse(data); // Parse and return the JSON data
}
