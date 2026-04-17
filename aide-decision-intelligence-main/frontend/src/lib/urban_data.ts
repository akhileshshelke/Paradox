import { StationReading } from "./types";

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

export interface UrbanContext {
  aqi: number;
  pm25: number;
  traffic: number;
  windSpeed: number;
  windDir: number;
  humidity: number;
  satelliteIndex: number; // 0 to 1
  industrialIndex: number; // 0 to 1
}

export interface PredictionPoint {
  time: string;
  aqi: number;
  confidence: number;
}

export interface CommandAction {
  id: string;
  title: string;
  impact: number; // reduction in AQI
  type: 'traffic' | 'industry' | 'construction';
}

/**
 * Fuses sensor data with macro feeds.
 * If OpenWeather API key is present, it uses it for real-time pollution metrics.
 * Otherwise, it generates high-fidelity mock data for the simulation.
 */
export async function fuseSensoryData(station: StationReading): Promise<UrbanContext> {
  let weatherData = { wind_speed: station.wind_speed, wind_deg: station.wind_dir, humidity: station.humidity };
  let pollutionData = { aqi: station.aqi, pm2_5: station.pm25 };

  if (OPENWEATHER_API_KEY) {
    try {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${station.lat}&lon=${station.lng}&appid=${OPENWEATHER_API_KEY}`);
      if (weatherRes.ok) {
        const w = await weatherRes.json();
        weatherData = { wind_speed: w.wind.speed, wind_deg: w.wind.deg, humidity: w.main.humidity };
      }

      const pollutionRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${station.lat}&lon=${station.lng}&appid=${OPENWEATHER_API_KEY}`);
      if (pollutionRes.ok) {
        const p = await pollutionRes.json();
        // OpenWeather AQI is 1-5, we map it to our internal scale or just use their pm2_5
        pollutionData = { aqi: station.aqi, pm2_5: p.list[0].components.pm2_5 };
      }
    } catch (e) {
      console.warn("OpenWeather fetch failed, using fallbacks:", e);
    }
  }

  return {
    aqi: pollutionData.aqi,
    pm25: pollutionData.pm2_5,
    traffic: station.traffic_index || 0.65,
    windSpeed: weatherData.wind_speed || 5.2,
    windDir: weatherData.wind_deg || 180,
    humidity: weatherData.humidity || 45,
    satelliteIndex: 0.72 + (Math.random() * 0.1),
    industrialIndex: 0.45 + (Math.random() * 0.1),
  };
}

/**
 * Spatiotemporal predictive model mock.
 * Generates 12 hours of forecasted data.
 */
export function generate12HForecast(baseContext: UrbanContext): PredictionPoint[] {
  const points: PredictionPoint[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const time = new Date(now.getTime() + i * 3600000);
    // Sine wave + random walk for AQI forecast
    const drift = i * 2;
    const varience = Math.sin(i / 2) * 20;
    points.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      aqi: Math.round(baseContext.aqi + drift + varience),
      confidence: Math.max(0.6, 0.95 - i * 0.03),
    });
  }
  return points;
}

export const INTERVENTIONS: CommandAction[] = [
  { id: 'v_ban',  title: 'HEAVY VEHICLE BAN [ZONE 4]', impact: 45, type: 'traffic' },
  { id: 'ind_th', title: 'INDUSTRIAL THROTTLE [70%]', impact: 35, type: 'industry' },
  { id: 'con_st', title: 'SUSPEND CONSTRUCTION [ALL]', impact: 25, type: 'construction' },
  { id: 'odd_ev', title: 'ODD-EVEN TRAFFIC [CORE]', impact: 60, type: 'traffic' },
];
