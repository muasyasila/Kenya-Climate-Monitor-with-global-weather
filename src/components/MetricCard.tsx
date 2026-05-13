import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: LucideIcon;
    trend?: number;
    subtitle?: string;
}

export function MetricCard({ title, value, unit, icon: Icon, trend, subtitle }: MetricCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-semibold text-gray-900">{value}</p>
                        {unit && <span className="text-sm text-gray-400">{unit}</span>}
                    </div>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                </div>
            </div>
            {trend !== undefined && (
                <div className={`mt-3 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
                </div>
            )}
        </div>
    );
}