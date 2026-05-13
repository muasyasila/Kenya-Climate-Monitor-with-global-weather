import { NextRequest, NextResponse } from 'next/server';

// Cache historical data in memory with TTL
interface CacheEntry {
    data: any;
    timestamp: number;
}

const historicalCache = new Map<string, CacheEntry>();
const CACHE_TTL = 3600000; // 1 hour

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const days = parseInt(searchParams.get('days') || '7');

    if (!city) {
        return NextResponse.json({ error: 'City required' }, { status: 400 });
    }

    const cacheKey = `${city}-${days}`;
    const cached = historicalCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data);
    }

    try {
        // Fetch both weather and air quality history in parallel
        const coords = await getCityCoordinates(city);

        const [weatherRes, airQualityRes] = await Promise.all([
            fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${getPastDate(days)}&end_date=${getToday()}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa/Nairobi`),
            fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&hourly=pm10,pm2_5&timezone=Africa/Nairobi`)
        ]);

        const weatherData = await weatherRes.json();
        const airQualityData = await airQualityRes.json();

        // Transform and merge data
        const mergedData = mergeHistoricalData(weatherData, airQualityData);

        historicalCache.set(cacheKey, { data: mergedData, timestamp: Date.now() });

        return NextResponse.json(mergedData);
    } catch (error) {
        console.error('Historical data error:', error);
        return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 503 });
    }
}

function getPastDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

async function getCityCoordinates(city: string): Promise<{ lat: number; lon: number }> {
    // Expanded city database
    const cities: Record<string, { lat: number; lon: number }> = {
        'Nairobi': { lat: -1.2864, lon: 36.8172 },
        'Mombasa': { lat: -4.0435, lon: 39.6682 },
        'Kisumu': { lat: -0.1022, lon: 34.7617 },
        'Nakuru': { lat: -0.3031, lon: 36.0800 },
        'Eldoret': { lat: 0.5143, lon: 35.2698 },
        'Thika': { lat: -1.0388, lon: 37.0833 },
        'Malindi': { lat: -3.2187, lon: 40.1169 },
        'Garissa': { lat: -0.4569, lon: 39.6583 },
        'Kitale': { lat: 1.0191, lon: 35.0023 },
        'Kakamega': { lat: 0.2827, lon: 34.7519 },
    };

    const normalized = city.split(',')[0].trim();
    const match = cities[normalized];

    if (!match) {
        throw new Error(`City not found: ${city}`);
    }

    return match;
}

function mergeHistoricalData(weatherData: any, airQualityData: any): any {
    // Implementation: align dates and combine datasets
    const dates = weatherData.daily?.time || [];
    const maxTemps = weatherData.daily?.temperature_2m_max || [];
    const minTemps = weatherData.daily?.temperature_2m_min || [];
    const rainfall = weatherData.daily?.precipitation_sum || [];

    // Process hourly air quality into daily averages
    const pm25ByDay: Record<string, number[]> = {};
    const pm10ByDay: Record<string, number[]> = {};

    if (airQualityData.hourly?.time) {
        for (let i = 0; i < airQualityData.hourly.time.length; i++) {
            const date = airQualityData.hourly.time[i].split('T')[0];
            if (!pm25ByDay[date]) {
                pm25ByDay[date] = [];
                pm10ByDay[date] = [];
            }
            pm25ByDay[date].push(airQualityData.hourly.pm2_5[i]);
            pm10ByDay[date].push(airQualityData.hourly.pm10[i]);
        }
    }

    const result = dates.map((date: string, index: number) => ({
        date,
        maxTemp: maxTemps[index],
        minTemp: minTemps[index],
        rainfall: rainfall[index],
        avgPM25: pm25ByDay[date] ? Math.round(average(pm25ByDay[date])) : null,
        avgPM10: pm10ByDay[date] ? Math.round(average(pm10ByDay[date])) : null,
    }));

    return result;
}

function average(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}