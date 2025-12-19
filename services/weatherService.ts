import { geocodeAddress } from './maps';

export interface WeatherData {
    temp: number;
    condition: string;
    icon: string;
    description: string;
}

export const getWeather = async (locationName: string): Promise<WeatherData | null> => {
    try {
        const coords = await geocodeAddress(locationName);
        if (!coords) return null;

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`
        );
        const data = await response.json();

        const weatherCode = data.current_weather.weathercode;
        const info = getWeatherInfo(weatherCode);

        return {
            temp: Math.round(data.current_weather.temperature),
            condition: info.label,
            icon: info.icon,
            description: info.label
        };
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
};

const getWeatherInfo = (code: number) => {
    if (code === 0) return { label: '晴朗', icon: '☀️' };
    if (code <= 3) return { label: '多雲', icon: '☁️' };
    if (code <= 67) return { label: '有雨', icon: '🌧️' };
    if (code <= 77) return { label: '有雪', icon: '❄️' };
    return { label: '雷雨', icon: '⚡' };
};
