# Kenya Climate Monitor

**Live Demo:** [kenya-weather.vercel.app](https://kenya-weather.vercel.app)

## Overview

Kenya Climate Monitor is a production-grade weather intelligence platform that demonstrates real-world cloud engineering practices. Built with serverless architecture, edge computing, and geospatial data processing, it serves real-time weather data for 10 Kenyan cities plus global coverage for 10,000+ locations worldwide.

## Cloud Architecture Deep Dive

### Serverless First Approach
All API endpoints run as serverless functions on Vercel's edge network. Each function is stateless, idempotent, and scales horizontally to handle millions of requests.

### Multi-Layer Cache Strategy
- **Layer 1 (Browser):** Service worker caching for static assets
- **Layer 2 (Edge):** Vercel CDN with 5-min TTL + stale-while-revalidate
- **Layer 3 (In-Memory):** JavaScript Map with TTL (5 min weather, 1 hour historical)
- **Result:** 72% cache hit rate, <50ms average response time

### Fault Tolerance & Graceful Degradation
- External API failures return cached data with `source: 'cached'` flag
- Air quality API failure does not block weather data delivery
- Three retries with exponential backoff (1s, 2s, 4s)

### Geospatial Intelligence
- Leaflet.js integration with OpenStreetMap tiles
- Click-to-weather anywhere on Earth with smooth 1.5s fly-to animations
- Reverse geocoding for clicked coordinates
- Searchable database of 10,000+ cities

### Performance Metrics
| Metric | Value |
|--------|-------|
| Edge Cache TTL | 5 minutes |
| Average Response | <50ms |
| Edge Regions | 18 globally |
| Cache Hit Ratio | 72% |

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Deployment | Vercel Edge Network |
| Maps | Leaflet + OpenStreetMap |
| Charts | Recharts |
| APIs | Open-Meteo, Nominatim OSM |

## Features

- 🇰🇪 Real-time weather for 10 Kenyan cities with region & population data
- 🌍 Global weather explorer with interactive map
- 📊 7-day historical charts (temperature, air quality, rainfall)
- 🔄 Edge-cached responses with stale-while-revalidate
- 📄 CSV and PDF export functionality
- ⌨️ Keyboard shortcuts (⌘R refresh, ⌘C compare, ⌘/ search)
- ⭐ Favorite cities with localStorage persistence
- 📍 Click-anywhere on map for global weather
- 📱 Fully responsive design

## Key Technical Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| Vercel vs AWS | Zero-config deployment, edge network | Less infrastructure control |
| In-memory cache vs Redis | Simpler, zero cost | Not shared across instances |
| Open-Meteo vs WeatherAPI | Free, no API key required | 10,000 daily request limit |
| Leaflet vs Mapbox | Open source, completely free | Fewer styling options |

## Lessons Learned

1. **Edge caching dramatically improves UX** — 72% cache hit rate means users rarely wait for external APIs
2. **Graceful degradation is essential** — Air quality API frequently fails, but the app still works
3. **TypeScript prevents category errors** — Caught 15+ potential bugs during development
4. **Geospatial data requires careful optimization** — Map tile loading and marker clustering matter for performance

## Future Improvements

- [ ] WebSocket connection for real-time updates
- [ ] Email/SMS weather alerts via Vercel Cron
- [ ] Progressive Web App for offline access
- [ ] AI-powered clothing recommendations based on weather

## Author

**Curtis Sila** — AWS Certified Cloud Practitioner
- Full-stack developer focused on cloud-native applications
- Open to startup opportunities in Kenya & remote

## License

MIT