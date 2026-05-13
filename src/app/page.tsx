import { Suspense } from 'react';
import WeatherApp from '@/components/WeatherApp';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    }>
      <>
        <WeatherApp />

        {/* Professional Footer */}
        <footer className="bg-white border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

              {/* About Section */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">KC</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">Kenya Climate Monitor</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  A production-grade weather intelligence platform demonstrating cloud-native architecture,
                  serverless computing, and geospatial data processing. Built for Kenya's major cities
                  with global weather coverage.
                </p>
                <div className="flex gap-4">
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">Live Data</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Edge Cached</span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">Serverless</span>
                </div>
              </div>

              {/* Architecture Links */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Architecture</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-500 hover:text-gray-700">Serverless Functions</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-gray-700">Multi-Layer Cache</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-gray-700">Edge Network (18 regions)</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-gray-700">Fault Tolerance</a></li>
                </ul>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Technologies</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-500">Next.js 16 / React 19</li>
                  <li className="text-gray-500">TypeScript / Tailwind CSS</li>
                  <li className="text-gray-500">Vercel Edge / Leaflet</li>
                  <li className="text-gray-500">Open-Meteo API / Recharts</li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Kenya Climate Monitor — Built by Curtis Sila
              </p>
              <div className="flex gap-4 text-xs">
                <span className="text-gray-400">☁️ AWS Certified Cloud Practitioner</span>
                <span className="text-gray-400">⚡ Vercel Edge Network</span>
                <span className="text-gray-400">🌍 Global Weather Coverage</span>
              </div>
            </div>
          </div>
        </footer>
      </>
    </Suspense>
  );
}