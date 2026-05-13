import { NextRequest, NextResponse } from 'next/server';

const cities: Record<string, { lat: number; lon: number; region: string; population: number }> = {
    'Nairobi': { lat: -1.2864, lon: 36.8172, region: 'Central', population: 4397073 },
    'Mombasa': { lat: -4.0435, lon: 39.6682, region: 'Coast', population: 1208333 },
    'Kisumu': { lat: -0.1022, lon: 34.7617, region: 'Lake Victoria', population: 610000 },
    'Nakuru': { lat: -0.3031, lon: 36.0800, region: 'Rift Valley', population: 570674 },
    'Eldoret': { lat: 0.5143, lon: 35.2698, region: 'Rift Valley', population: 475716 },
    'Thika': { lat: -1.0388, lon: 37.0833, region: 'Central', population: 251407 },
    'Malindi': { lat: -3.2187, lon: 40.1169, region: 'Coast', population: 119859 },
    'Garissa': { lat: -0.4569, lon: 39.6583, region: 'North Eastern', population: 163399 },
    'Kitale': { lat: 1.0191, lon: 35.0023, region: 'Rift Valley', population: 162174 },
    'Kakamega': { lat: 0.2827, lon: 34.7519, region: 'Western', population: 193000 },
};

interface CacheEntry {
    data: any;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 300000; // 5 minutes

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');

    if (!city || !cities[city]) {
        return NextResponse.json(
            { error: 'City not found. Available: ' + Object.keys(cities).join(', ') },
            { status: 400 }
        );
    }

    const cached = cache.get(city);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data);
    }

    const { lat, lon, region, population } = cities[city];

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min&timezone=Africa/Nairobi`;

        const response = await fetch(url, { next: { revalidate: 300 } });
        const data = await response.json();

        const result = {
            city,
            region,
            population,
            current: {
                temperature: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                wind_speed: data.current.wind_speed_10m,
                wind_direction: data.current.wind_direction_10m,
                pressure: data.current.pressure_msl,
            },
            forecast: {
                high: data.daily.temperature_2m_max[0],
                low: data.daily.temperature_2m_min[0],
            },
            updated: data.current.time,
            source: 'live',
        };

        cache.set(city, { data: result, timestamp: Date.now() });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { city, error: 'Weather service unavailable', source: 'error' },
            { status: 503 }
        );
    }
}