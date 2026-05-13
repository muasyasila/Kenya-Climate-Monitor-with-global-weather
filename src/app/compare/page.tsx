'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftRight, Thermometer, Droplets, Wind, Gauge, X, Plus } from 'lucide-react';
import Link from 'next/link';

interface WeatherData {
    city: string;
    region: string;
    current: {
        temperature: number;
        humidity: number;
        wind_speed: number;
        pressure: number;
    };
}

const AVAILABLE_CITIES = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
    'Thika', 'Malindi', 'Garissa', 'Kitale', 'Kakamega'
];

export default function ComparePage() {
    const [selectedCities, setSelectedCities] = useState<string[]>(['Nairobi', 'Mombasa']);
    const [weatherData, setWeatherData] = useState<Map<string, WeatherData>>(new Map());
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchCityData = async (city: string): Promise<WeatherData | null> => {
        try {
            const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error(`Failed to fetch ${city}`, err);
            return null;
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const results = new Map<string, WeatherData>();
            await Promise.all(
                selectedCities.map(async (city) => {
                    const data = await fetchCityData(city);
                    if (data) results.set(city, data);
                })
            );
            setWeatherData(results);
            setLoading(false);
        };
        fetchAll();
    }, [selectedCities]);

    const addCity = (city: string) => {
        if (!selectedCities.includes(city) && selectedCities.length < 4) {
            setSelectedCities([...selectedCities, city]);
            setShowAddModal(false);
        }
    };

    const removeCity = (city: string) => {
        setSelectedCities(selectedCities.filter(c => c !== city));
    };

    const getMetricDiff = (city1: WeatherData, city2: WeatherData, metric: keyof WeatherData['current']) => {
        const val1 = city1.current[metric];
        const val2 = city2.current[metric];
        const diff = val1 - val2;
        return diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)}` : '0';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
                                ← Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                                <ArrowLeftRight className="w-6 h-6 text-blue-500" />
                                Compare Cities
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            disabled={selectedCities.length >= 4}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add City (max 4)
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                    </div>
                ) : (
                    <>
                        {/* Comparison Grid */}
                        <div className="overflow-x-auto">
                            <table className="w-full bg-white rounded-xl border border-gray-200">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="p-4 text-left text-sm font-medium text-gray-500 w-32">Metric</th>
                                        {selectedCities.map(city => (
                                            <th key={city} className="p-4 text-left min-w-[200px]">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="font-bold text-gray-900">{city}</div>
                                                        <div className="text-xs text-gray-400">
                                                            {weatherData.get(city)?.region}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeCity(city)}
                                                        className="p-1 hover:bg-gray-100 rounded-full"
                                                    >
                                                        <X className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {/* Temperature row with comparison */}
                                    <tr className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="w-4 h-4" />
                                                Temperature
                                            </div>
                                        </td>
                                        {selectedCities.map((city, idx) => {
                                            const data = weatherData.get(city);
                                            const firstData = weatherData.get(selectedCities[0]);
                                            const diff = firstData && data && idx !== 0
                                                ? getMetricDiff(data, firstData, 'temperature')
                                                : null;
                                            return (
                                                <td key={city} className="p-4">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xl font-semibold">
                                                            {data ? `${Math.round(data.current.temperature)}°C` : '—'}
                                                        </span>
                                                        {diff && (
                                                            <span className={`text-xs ${diff.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>
                                                                {diff}° vs {selectedCities[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Humidity */}
                                    <tr className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Droplets className="w-4 h-4" />
                                                Humidity
                                            </div>
                                        </td>
                                        {selectedCities.map((city, idx) => {
                                            const data = weatherData.get(city);
                                            const firstData = weatherData.get(selectedCities[0]);
                                            const diff = firstData && data && idx !== 0
                                                ? getMetricDiff(data, firstData, 'humidity')
                                                : null;
                                            return (
                                                <td key={city} className="p-4">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xl font-semibold">
                                                            {data ? `${Math.round(data.current.humidity)}%` : '—'}
                                                        </span>
                                                        {diff && (
                                                            <span className={`text-xs ${diff.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>
                                                                {diff}% vs {selectedCities[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Wind Speed */}
                                    <tr className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Wind className="w-4 h-4" />
                                                Wind Speed
                                            </div>
                                        </td>
                                        {selectedCities.map(city => {
                                            const data = weatherData.get(city);
                                            return (
                                                <td key={city} className="p-4">
                                                    <span className="text-xl font-semibold">
                                                        {data ? `${Math.round(data.current.wind_speed)} km/h` : '—'}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Pressure */}
                                    <tr className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Gauge className="w-4 h-4" />
                                                Pressure
                                            </div>
                                        </td>
                                        {selectedCities.map(city => {
                                            const data = weatherData.get(city);
                                            return (
                                                <td key={city} className="p-4">
                                                    <span className="text-xl font-semibold">
                                                        {data ? `${Math.round(data.current.pressure)} hPa` : '—'}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Winner announcement */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-700">
                                🏆 <strong>Analysis:</strong> {
                                    (() => {
                                        const temps = selectedCities.map(c => weatherData.get(c)?.current.temperature || 0);
                                        const warmest = selectedCities[temps.indexOf(Math.max(...temps))];
                                        const coolest = selectedCities[temps.indexOf(Math.min(...temps))];
                                        return `${warmest} is the warmest today, while ${coolest} is the coolest. `;
                                    })()
                                }
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Add City Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Add City</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                            {AVAILABLE_CITIES.filter(c => !selectedCities.includes(c)).map(city => (
                                <button
                                    key={city}
                                    onClick={() => addCity(city)}
                                    className="p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                                >
                                    <div className="font-medium">{city}</div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="mt-4 w-full p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}