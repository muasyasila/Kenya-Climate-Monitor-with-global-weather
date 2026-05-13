export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
    const d = new Date(date);
    if (format === 'short') {
        return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

export function getAQICategory(pm25: number): { label: string; color: string; description: string } {
    if (pm25 <= 12) return { label: 'Good', color: '#10b981', description: 'Air quality is satisfactory' };
    if (pm25 <= 35.4) return { label: 'Moderate', color: '#f59e0b', description: 'Acceptable for most' };
    if (pm25 <= 55.4) return { label: 'Unhealthy for Sensitive', color: '#f97316', description: 'Sensitive groups should reduce outdoor activity' };
    if (pm25 <= 150.4) return { label: 'Unhealthy', color: '#ef4444', description: 'Everyone may begin to experience health effects' };
    return { label: 'Hazardous', color: '#7f1d1d', description: 'Health alert: everyone should avoid outdoor activity' };
}

export function getWindDirection(degrees: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
}

export function downloadJSON(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function downloadCSV(data: any[], filename: string) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}