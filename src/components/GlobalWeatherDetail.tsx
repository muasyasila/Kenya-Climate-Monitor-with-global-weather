'use client';

import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Gauge, MapPin, ArrowLeft } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { formatDate, formatTime, getWindDirection } from '@/lib/utils';

interface WeatherData {
    city: string;
    current: {
        temperature: number;
        humidity: number;
        wind_speed: number;
        wind_direction: number;
        pressure: number;
    };
    updated: string;
    source: string;
}

interface GlobalWeatherDetailProps {
    cityName: string;
    lat: number;
    lon: number;
    onBack: () => void;
}

export function GlobalWeatherDetail({ cityName, lat, lon, onBack }: GlobalWeatherDetailProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/weather/coordinates?lat=${lat}&lon=${lon}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setWeather({
                    city: cityName,
                    current: data.current,
                    updated: data.updated,
                    source: data.source,
                });
            } catch (err) {
                setError('Unable to load weather data');
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, [lat, lon, cityName]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <p className="text-amber-700">{error || 'Unable to load weather data'}</p>
                <button onClick={onBack} className="mt-4 text-blue-600 text-sm hover:underline">
                    ← Back to Globe
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Globe
            </button>

            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-blue-500" />
                            {weather.city}
                        </h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Global location • Live weather data
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-bold text-amber-600">
                        {Math.round(weather.current.temperature)}°C
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Humidity"
                    value={weather.current.humidity}
                    unit="%"
                    icon={Droplets}
                />
                <MetricCard
                    title="Wind"
                    value={Math.round(weather.current.wind_speed)}
                    unit="km/h"
                    icon={Wind}
                    subtitle={`Direction: ${getWindDirection(weather.current.wind_direction)}`}
                />
                <MetricCard
                    title="Pressure"
                    value={Math.round(weather.current.pressure)}
                    unit="hPa"
                    icon={Gauge}
                />
                <MetricCard
                    title="Feels Like"
                    value={Math.round(weather.current.temperature)}
                    unit="°C"
                    icon={Thermometer}
                />
            </div>

            <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 flex justify-between">
                <span>Data from Open-Meteo API</span>
                <span>Last updated: {formatTime(new Date(weather.updated))}</span>
                <span className="flex items-center gap-1">
                    🌍 Global weather
                </span>
            </div>
        </div>
    );
}