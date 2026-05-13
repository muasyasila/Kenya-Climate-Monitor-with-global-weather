'use client';

import { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Legend, BarChart, Bar, ComposedChart, Area
} from 'recharts';
import { Calendar, TrendingUp, Droplets, Wind, Loader2 } from 'lucide-react';

interface HistoricalDataPoint {
    date: string;
    maxTemp: number;
    minTemp: number;
    rainfall: number;
    avgPM25: number | null;
    avgPM10: number | null;
}

interface HistoricalChartProps {
    city: string;
    days?: number;
}

export function HistoricalChart({ city, days = 7 }: HistoricalChartProps) {
    const [data, setData] = useState<HistoricalDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<'temperature' | 'airquality' | 'rainfall'>('temperature');

    useEffect(() => {
        const fetchHistorical = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/historical?city=${encodeURIComponent(city)}&days=${days}`);
                if (!res.ok) throw new Error('Failed to fetch historical data');
                const historicalData = await res.json();
                setData(historicalData);
            } catch (err) {
                console.error('Historical fetch error:', err);
                setError('Unable to load historical data. The air quality API may be temporarily unavailable.');
                // Fallback to mock data for demonstration
                setData(generateMockData(days));
            } finally {
                setLoading(false);
            }
        };

        if (city) {
            fetchHistorical();
        }
    }, [city, days]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-gray-500 text-sm">Loading 7-day historical data...</p>
            </div>
        );
    }

    if (error && data.length === 0) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <p className="text-amber-700 text-sm">{error}</p>
                <p className="text-gray-500 text-xs mt-2">Showing sample data for demonstration</p>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                    <p className="font-semibold text-gray-900 mb-2">{formatDate(label)}</p>
                    {payload.map((p: any, idx: number) => (
                        <p key={idx} className="text-gray-600" style={{ color: p.color }}>
                            {p.name}: {p.value}{p.unit || ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getChart = () => {
        switch (chartType) {
            case 'temperature':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                            />
                            <YAxis
                                yAxisId="temp"
                                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                yAxisId="temp"
                                type="monotone"
                                dataKey="maxTemp"
                                name="Max Temp"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ fill: '#ef4444', r: 4 }}
                                unit="°C"
                            />
                            <Line
                                yAxisId="temp"
                                type="monotone"
                                dataKey="minTemp"
                                name="Min Temp"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                unit="°C"
                            />
                            <Area
                                yAxisId="temp"
                                type="monotone"
                                dataKey="maxTemp"
                                name="Temp Range"
                                stroke="none"
                                fill="#ef4444"
                                fillOpacity={0.1}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                );

            case 'airquality':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                            />
                            <YAxis
                                label={{ value: 'Concentration (µg/m³)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="avgPM25"
                                name="PM2.5"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', r: 4 }}
                                unit=" µg/m³"
                            />
                            <Line
                                type="monotone"
                                dataKey="avgPM10"
                                name="PM10"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ fill: '#f59e0b', r: 4 }}
                                unit=" µg/m³"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'rainfall':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                            />
                            <YAxis
                                label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                dataKey="rainfall"
                                name="Rainfall"
                                fill="#06b6d4"
                                radius={[4, 4, 0, 0]}
                                unit=" mm"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );
        }
    };

    // Calculate summary statistics
    const avgTemp = data.length ? (data.reduce((sum, d) => sum + d.maxTemp, 0) / data.length).toFixed(1) : 0;
    const maxTemp = data.length ? Math.max(...data.map(d => d.maxTemp)) : 0;
    const totalRainfall = data.length ? data.reduce((sum, d) => sum + d.rainfall, 0).toFixed(1) : 0;
    const avgPM25 = data.length && data.some(d => d.avgPM25 !== null)
        ? (data.filter(d => d.avgPM25 !== null).reduce((sum, d) => sum + (d.avgPM25 || 0), 0) / data.filter(d => d.avgPM25 !== null).length).toFixed(0)
        : null;

    return (
        <div className="space-y-4">
            {/* Chart controls */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                <button
                    onClick={() => setChartType('temperature')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${chartType === 'temperature'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <TrendingUp className="w-4 h-4" />
                    Temperature
                </button>
                <button
                    onClick={() => setChartType('airquality')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${chartType === 'airquality'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <Wind className="w-4 h-4" />
                    Air Quality
                </button>
                <button
                    onClick={() => setChartType('rainfall')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${chartType === 'rainfall'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <Droplets className="w-4 h-4" />
                    Rainfall
                </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Avg High Temp</p>
                    <p className="text-xl font-bold text-gray-900">{avgTemp}°C</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Peak Temp</p>
                    <p className="text-xl font-bold text-red-600">{maxTemp}°C</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total Rainfall</p>
                    <p className="text-xl font-bold text-cyan-600">{totalRainfall} mm</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Avg PM2.5</p>
                    <p className="text-xl font-bold text-green-600">{avgPM25 || '—'} µg/m³</p>
                </div>
            </div>

            {/* The chart */}
            {getChart()}

            {/* Data table (expandable) */}
            <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    View raw data table
                </summary>
                <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left p-2 font-medium text-gray-600">Date</th>
                                <th className="text-left p-2 font-medium text-gray-600">Max Temp</th>
                                <th className="text-left p-2 font-medium text-gray-600">Min Temp</th>
                                <th className="text-left p-2 font-medium text-gray-600">Rainfall</th>
                                <th className="text-left p-2 font-medium text-gray-600">PM2.5</th>
                                <th className="text-left p-2 font-medium text-gray-600">PM10</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((day, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-2 text-gray-900">{formatDate(day.date)}</td>
                                    <td className="p-2">{day.maxTemp}°C</td>
                                    <td className="p-2 text-gray-500">{day.minTemp}°C</td>
                                    <td className="p-2">{day.rainfall} mm</td>
                                    <td className="p-2">{day.avgPM25 || '—'} µg/m³</td>
                                    <td className="p-2">{day.avgPM10 || '—'} µg/m³</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    );
}

// Fallback mock data generator
function generateMockData(days: number): HistoricalDataPoint[] {
    const data: HistoricalDataPoint[] = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            maxTemp: 22 + Math.sin(i) * 3 + Math.random() * 2,
            minTemp: 15 + Math.sin(i) * 2 + Math.random() * 2,
            rainfall: Math.random() * 10,
            avgPM25: 20 + Math.random() * 30,
            avgPM10: 30 + Math.random() * 40,
        });
    }
    return data;
}