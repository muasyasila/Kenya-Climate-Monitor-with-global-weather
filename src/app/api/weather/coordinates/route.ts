import { NextRequest, NextResponse } from 'next/server';

interface CacheEntry {
    data: any;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 300000; // 5 minutes

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Latitude and longitude required' }, { status: 400 });
    }

    const cacheKey = `${lat},${lon}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data);
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl&timezone=auto`;

        const response = await fetch(url);
        const data = await response.json();

        const result = {
            current: {
                temperature: data.current?.temperature_2m,
                humidity: data.current?.relative_humidity_2m,
                wind_speed: data.current?.wind_speed_10m,
                wind_direction: data.current?.wind_direction_10m,
                pressure: data.current?.pressure_msl,
            },
            updated: data.current?.time,
            source: 'live',
        };

        cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return NextResponse.json(result);
    } catch (error) {
        console.error('Coordinates weather error:', error);
        return NextResponse.json({ error: 'Weather service unavailable' }, { status: 503 });
    }
}