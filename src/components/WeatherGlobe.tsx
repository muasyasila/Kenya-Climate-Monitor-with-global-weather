'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, Loader2, Thermometer, Droplets, Wind } from 'lucide-react';

// Dynamically import Leaflet components with no SSR
import dynamic from 'next/dynamic';

// Import Leaflet CSS separately
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import L from 'leaflet';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamic imports with no SSR
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);

const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);

const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);

const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

interface WeatherData {
    city: string;
    country: string;
    lat: number;
    lon: number;
    temperature: number;
    humidity: number;
    wind_speed: number;
    condition: string;
    updated?: string;
}

interface WeatherGlobeProps {
    onCitySelect?: (city: string) => void;
}

// Separate component for map to handle hooks properly with flyTo support
function MapComponent({
    center,
    zoom,
    selectedLocation,
    onMapClick,
    onMapReady
}: {
    center: [number, number];
    zoom: number;
    selectedLocation: WeatherData | null;
    onMapClick: (lat: number, lng: number) => void;
    onMapReady: (map: any) => void;
}) {
    const [MapEvents, setMapEvents] = useState<any>(null);

    useEffect(() => {
        import('react-leaflet').then(({ useMapEvents }) => {
            const MapEventsComponent = () => {
                const map = useMapEvents({
                    click(e: any) {
                        onMapClick(e.latlng.lat, e.latlng.lng);
                    },
                    load() {
                        onMapReady(map);
                    }
                });
                return null;
            };
            setMapEvents(() => MapEventsComponent);
        });
    }, [onMapClick, onMapReady]);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '400px', width: '100%', borderRadius: '12px' }}
            className="z-0"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
            />
            {selectedLocation && (
                <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
                    <Popup>
                        <div className="text-sm min-w-[150px]">
                            <p className="font-bold text-gray-900">{selectedLocation.city}</p>
                            <p className="text-2xl font-bold">{Math.round(selectedLocation.temperature)}°C</p>
                            <p className="text-gray-600">{selectedLocation.condition}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                💧 {selectedLocation.humidity}% • 💨 {Math.round(selectedLocation.wind_speed)} km/h
                            </p>
                        </div>
                    </Popup>
                </Marker>
            )}
            {MapEvents && <MapEvents />}
        </MapContainer>
    );
}

// Component for displaying detailed weather below the map
function GlobalWeatherDetail({ location, onClose }: { location: WeatherData | null; onClose: () => void }) {
    if (!location) return null;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        {location.city}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Coordinates: {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                >
                    Close
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Thermometer className="w-4 h-4" />
                        Temperature
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(location.temperature)}°C</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Droplets className="w-4 h-4" />
                        Humidity
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{location.humidity}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <Wind className="w-4 h-4" />
                        Wind Speed
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(location.wind_speed)} km/h</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <span>🌤️</span>
                        Condition
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{location.condition}</p>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 flex justify-between">
                <span>Data from Open-Meteo API</span>
                <span>Last updated: {location.updated ? new Date(location.updated).toLocaleTimeString() : formatTime(new Date())}</span>
                <span className="flex items-center gap-1">Global weather</span>
            </div>
        </div>
    );
}

export function WeatherGlobe({ onCitySelect }: WeatherGlobeProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<WeatherData | null>(null);
    const [detailedLocation, setDetailedLocation] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-1.2864, 36.8172]);
    const [zoom, setZoom] = useState(5);
    const [isMounted, setIsMounted] = useState(false);
    const [flyToTarget, setFlyToTarget] = useState<[number, number] | null>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (flyToTarget && mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(flyToTarget, 12, {
                duration: 1.5,
                easeLinearity: 0.25
            });
            setFlyToTarget(null);
        }
    }, [flyToTarget]);

    const searchCities = useCallback(async () => {
        if (!searchTerm.trim() || searchTerm.length < 2) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=10&addressdetails=1`
            );
            const data = await res.json();
            setSearchResults(data);
        } catch (err) {
            setError('Search failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    const fetchWeatherAtLocation = useCallback(async (lat: number, lon: number, name: string): Promise<WeatherData | null> => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/weather/coordinates?lat=${lat}&lon=${lon}`);
            if (!res.ok) throw new Error('Weather fetch failed');
            const weather = await res.json();

            const locationData = {
                city: name,
                country: '',
                lat,
                lon,
                temperature: weather.current.temperature,
                humidity: weather.current.humidity,
                wind_speed: weather.current.wind_speed,
                condition: weather.current.temperature > 25 ? 'Sunny' : weather.current.temperature > 18 ? 'Partly Cloudy' : 'Cool',
                updated: weather.updated,
            };

            setSelectedLocation(locationData);
            return locationData;
        } catch (err) {
            setError('Unable to fetch weather for this location');
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLocationSelect = async (location: any) => {
        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);
        const name = location.display_name.split(',')[0];

        setFlyToTarget([lat, lon]);
        setMapCenter([lat, lon]);
        setZoom(12);
        await fetchWeatherAtLocation(lat, lon, name);
        setSearchResults([]);
        setSearchTerm('');
    };

    const handleMapClick = async (lat: number, lon: number) => {
        setFlyToTarget([lat, lon]);
        setMapCenter([lat, lon]);
        setZoom(12);
        await fetchWeatherAtLocation(lat, lon, `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
    };

    const handleViewDetails = () => {
        if (selectedLocation) {
            setDetailedLocation(selectedLocation);
        }
    };

    const handleCloseDetails = () => {
        setDetailedLocation(null);
    };

    const handleMapReady = useCallback((map: any) => {
        mapInstanceRef.current = map;
    }, []);

    if (!isMounted) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4 relative">
            {/* Search Bar */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchCities()}
                            placeholder="Search any city in the world... (e.g., London, Tokyo, Cape Town)"
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <button
                        onClick={searchCities}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        Search
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-20">
                        {searchResults.map((result, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleLocationSelect(result)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            >
                                <p className="text-sm font-medium text-gray-900">{result.display_name.split(',')[0]}</p>
                                <p className="text-xs text-gray-500">{result.display_name}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="relative">
                <MapComponent
                    center={mapCenter}
                    zoom={zoom}
                    selectedLocation={selectedLocation}
                    onMapClick={handleMapClick}
                    onMapReady={handleMapReady}
                />
            </div>

            {loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                        <p className="text-sm text-gray-500">Fetching weather data...</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between text-xs text-gray-400">
                <span>Click anywhere on the map to see weather</span>
                <span>Search any city worldwide - map moves to location</span>
            </div>

            {selectedLocation && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-gray-900 flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                {selectedLocation.city}
                            </h4>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {Math.round(selectedLocation.temperature)}°C
                            </p>
                            <p className="text-sm text-gray-600">{selectedLocation.condition}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">💧 {selectedLocation.humidity}%</p>
                            <p className="text-sm text-gray-500">💨 {Math.round(selectedLocation.wind_speed)} km/h</p>
                        </div>
                    </div>
                    <button
                        onClick={handleViewDetails}
                        className="mt-3 w-full text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        View Detailed Weather
                    </button>
                </div>
            )}

            {detailedLocation && (
                <GlobalWeatherDetail
                    location={detailedLocation}
                    onClose={handleCloseDetails}
                />
            )}
        </div>
    );
}