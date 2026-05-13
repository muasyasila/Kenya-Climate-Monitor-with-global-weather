'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    Search, MapPin, Download, Calendar, TrendingUp,
    Wind, Droplets, Thermometer, Gauge,
    AlertCircle, CheckCircle, Star, ArrowLeftRight, FileText, Globe
} from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { formatDate, formatTime, getWindDirection, downloadCSV } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportToPDF } from '@/lib/exportToPDF';
import { HistoricalChart } from '@/components/HistoricalChart';

const WeatherGlobe = dynamic(
    () => import('@/components/WeatherGlobe').then((mod) => mod.WeatherGlobe),
    { ssr: false }
);

interface WeatherData {
    city: string;
    region: string;
    population: number;
    current: {
        temperature: number;
        humidity: number;
        wind_speed: number;
        wind_direction: number;
        pressure: number;
    };
    forecast: {
        high: number;
        low: number;
    };
    updated: string;
    source: string;
    error?: string;
}

interface FavoriteCity {
    name: string;
    addedAt: string;
}

const AVAILABLE_CITIES = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
    'Thika', 'Malindi', 'Garissa', 'Kitale', 'Kakamega'
];

export default function WeatherApp() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlCity = searchParams.get('city');

    const [weatherData, setWeatherData] = useState<Map<string, WeatherData>>(new Map());
    const [selectedCity, setSelectedCity] = useState('Nairobi');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('kenya-weather-favorites');
        if (saved) {
            setFavorites(JSON.parse(saved));
        }
    }, []);

    // Read city from URL on load
    useEffect(() => {
        if (urlCity && AVAILABLE_CITIES.includes(urlCity as any)) {
            setSelectedCity(urlCity);
        }
    }, [urlCity]);

    // Save favorites
    const saveFavorites = useCallback((newFavorites: FavoriteCity[]) => {
        setFavorites(newFavorites);
        localStorage.setItem('kenya-weather-favorites', JSON.stringify(newFavorites));
    }, []);

    const toggleFavorite = useCallback((cityName: string) => {
        const exists = favorites.some(f => f.name === cityName);
        if (exists) {
            saveFavorites(favorites.filter(f => f.name !== cityName));
        } else {
            saveFavorites([...favorites, { name: cityName, addedAt: new Date().toISOString() }]);
        }
    }, [favorites, saveFavorites]);

    const fetchWeather = useCallback(async (city: string): Promise<WeatherData | null> => {
        try {
            const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
            if (!res.ok) throw new Error(`Failed: ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error(`Error fetching ${city}:`, err);
            return null;
        }
    }, []);

    const fetchAllCities = useCallback(async () => {
        setLoading(true);
        const citiesToFetch = showFavoritesOnly && favorites.length
            ? favorites.map(f => f.name)
            : AVAILABLE_CITIES;

        const results = new Map<string, WeatherData>();
        await Promise.all(
            citiesToFetch.map(async (city) => {
                const data = await fetchWeather(city);
                if (data && !data.error) {
                    results.set(city, data);
                }
            })
        );

        setWeatherData(results);
        setLastUpdated(new Date());
        setLoading(false);
    }, [fetchWeather, showFavoritesOnly, favorites]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        fetchAllCities();
        const interval = setInterval(fetchAllCities, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchAllCities]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'r': () => fetchAllCities(),
        'c': () => window.location.href = '/compare',
        '/': () => document.querySelector('input')?.focus(),
    });

    const currentData = weatherData.get(selectedCity);

    const filteredCities = useMemo(() => {
        let cities = showFavoritesOnly && favorites.length
            ? favorites.map(f => f.name)
            : AVAILABLE_CITIES;

        if (searchTerm) {
            cities = cities.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return cities;
    }, [searchTerm, showFavoritesOnly, favorites]);

    const handleExport = useCallback(async () => {
        setExporting(true);
        const allData = Array.from(weatherData.values()).map(w => ({
            city: w.city,
            region: w.region,
            temperature: w.current.temperature,
            humidity: w.current.humidity,
            wind_speed: w.current.wind_speed,
            pressure: w.current.pressure,
            forecast_high: w.forecast.high,
            forecast_low: w.forecast.low,
            updated: w.updated,
        }));
        downloadCSV(allData, `kenya-weather-${new Date().toISOString().split('T')[0]}.csv`);
        setExporting(false);
    }, [weatherData]);

    const handleExportPDF = useCallback(async () => {
        setExportingPDF(true);
        await exportToPDF('dashboard-content', `kenya-weather-${selectedCity}`);
        setExportingPDF(false);
    }, [selectedCity]);

    const handleCitySelect = (city: string) => {
        setSelectedCity(city);
        setSearchTerm('');
        router.push(`/?city=${encodeURIComponent(city)}`, { scroll: false });
    };

    const getTemperatureColor = (temp: number) => {
        if (temp >= 28) return 'text-amber-600';
        if (temp >= 22) return 'text-green-600';
        if (temp >= 18) return 'text-blue-600';
        return 'text-indigo-600';
    };

    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-blue-500" />
                                Kenya Climate Monitor
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Real-time weather & air quality • {AVAILABLE_CITIES.length} cities • Updates every 5 minutes
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="text-xs text-gray-400 hidden md:flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                                ⌘R refresh • ⌘C compare • ⌘/ search
                            </div>

                            <Link
                                href="/compare"
                                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                                <ArrowLeftRight className="w-4 h-4" />
                                Compare
                            </Link>

                            <button
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${showFavoritesOnly
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-500 stroke-amber-500' : ''}`} />
                                Favorites
                            </button>

                            <button
                                onClick={handleExportPDF}
                                disabled={exportingPDF}
                                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                                <FileText className="w-4 h-4" />
                                {exportingPDF ? 'PDF...' : 'PDF'}
                            </button>

                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                                <Download className="w-4 h-4" />
                                {exporting ? 'Exporting...' : 'CSV'}
                            </button>

                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-400">Last updated</p>
                                <p className="text-xs text-gray-600">{formatTime(lastUpdated)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* KENYA FOCUS SECTION */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Kenyan cities... (⌘/)"
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {filteredCities.map(city => (
                            <button
                                key={city}
                                onClick={() => handleCitySelect(city)}
                                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedCity === city
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Kenya content */}
                <div id="dashboard-content">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                        </div>
                    ) : currentData ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-bold text-gray-900">{currentData.city}</h2>
                                        <button
                                            onClick={() => toggleFavorite(currentData.city)}
                                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <Star
                                                className={`w-5 h-5 ${favorites.some(f => f.name === currentData.city)
                                                    ? 'fill-amber-500 stroke-amber-500'
                                                    : 'text-gray-400'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                    <div className="flex gap-3 mt-1">
                                        <span className="text-sm text-gray-500">{currentData.region} Region</span>
                                        <span className="text-sm text-gray-400">•</span>
                                        <span className="text-sm text-gray-500">Population: {currentData.population.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-5xl font-bold ${getTemperatureColor(currentData.current.temperature)}`}>
                                        {Math.round(currentData.current.temperature)}°C
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        H: {Math.round(currentData.forecast.high)}° • L: {Math.round(currentData.forecast.low)}°
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricCard title="Humidity" value={currentData.current.humidity} unit="%" icon={Droplets} />
                                <MetricCard title="Wind" value={Math.round(currentData.current.wind_speed)} unit="km/h" icon={Wind} subtitle={`Direction: ${getWindDirection(currentData.current.wind_direction)}`} />
                                <MetricCard title="Pressure" value={Math.round(currentData.current.pressure)} unit="hPa" icon={Gauge} />
                                <MetricCard title="Feels Like" value={Math.round(currentData.current.temperature)} unit="°C" icon={Thermometer} />
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    7-Day Historical Data
                                </h3>
                                <HistoricalChart city={selectedCity} days={7} />
                            </div>

                            <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 flex justify-between">
                                <span>Data from Open-Meteo API</span>
                                <span>Last refreshed: {formatDate(lastUpdated, 'long')} at {formatTime(lastUpdated)}</span>
                                <span className="flex items-center gap-1">
                                    {currentData.source === 'live' ? (
                                        <><CheckCircle className="w-3 h-3 text-green-500" /> Live</>
                                    ) : (
                                        <><AlertCircle className="w-3 h-3 text-amber-500" /> Cached</>
                                    )}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                            <p className="text-amber-700">Unable to load weather data. Please try again.</p>
                        </div>
                    )}
                </div>

                {/* GLOBAL EXPLORER SECTION */}
                <div className="mt-16 pt-8 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-6 h-6 text-blue-500" />
                                <h2 className="text-2xl font-bold text-gray-900">Global Weather Explorer</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Click anywhere on the map or search any city worldwide to see real-time weather
                            </p>
                        </div>
                    </div>

                    <WeatherGlobe
                        onCitySelect={(city: string) => {
                            if (AVAILABLE_CITIES.includes(city as any)) {
                                setSelectedCity(city);
                                router.push(`/?city=${encodeURIComponent(city)}`, { scroll: false });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                    />
                </div>
            </div>
        </>
    );
}