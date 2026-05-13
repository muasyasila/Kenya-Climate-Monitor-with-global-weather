'use client';

import { useEffect, useRef } from 'react';

interface SparklineChartProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    showPoints?: boolean;
}

export function SparklineChart({
    data,
    width = 200,
    height = 60,
    color = '#667eea',
    showPoints = false
}: SparklineChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !data.length) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);

        if (data.length < 2) return;

        const values = data.map(v => v);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const step = width / (data.length - 1);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        let firstPoint = true;
        for (let i = 0; i < data.length; i++) {
            const x = i * step;
            const y = height - ((data[i] - min) / range) * height;

            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        if (showPoints) {
            for (let i = 0; i < data.length; i++) {
                const x = i * step;
                const y = height - ((data[i] - min) / range) * height;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }, [data, width, height, color, showPoints]);

    return <canvas ref={canvasRef} style={{ width, height }} />;
}