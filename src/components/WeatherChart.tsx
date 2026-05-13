'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface WeatherChartProps {
    data: Array<{ date: string; maxTemp: number; minTemp: number; avgPM25?: number | null }>;
    type: 'temperature' | 'airquality';
}

export function WeatherChart({ data, type }: WeatherChartProps) {
    const isTemp = type === 'temperature';

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={{ stroke: '#cbd5e1' }}
                    domain={isTemp ? ['auto', 'auto'] : [0, 'auto']}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                />
                {isTemp ? (
                    <>
                        <Line
                            type="monotone"
                            dataKey="maxTemp"
                            name="Max Temp (°C)"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="minTemp"
                            name="Min Temp (°C)"
                            stroke="#94a3b8"
                            strokeWidth={2}
                            dot={{ fill: '#94a3b8', strokeWidth: 2 }}
                        />
                    </>
                ) : (
                    <Line
                        type="monotone"
                        dataKey="avgPM25"
                        name="PM2.5 (µg/m³)"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
}