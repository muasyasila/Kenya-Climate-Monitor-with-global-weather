import { Suspense } from 'react';
import ComparePage from '@/components/ComparePage';

export default function Compare() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            </div>
        }>
            <ComparePage />
        </Suspense>
    );
}