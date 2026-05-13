# Kenya Climate Monitor

**Live Demo:** [kenya-climate-monitor-with-global-w.vercel.app](https://kenya-climate-monitor-with-global-w.vercel.app/)

**Status:** Production • Last updated: May 2026

---

## Overview

Kenya Climate Monitor is a production-grade weather intelligence platform that demonstrates real-world cloud engineering practices. The application serves real-time weather data for 10 Kenyan cities and provides global weather coverage through an interactive map interface.

**Technical Focus:** Serverless architecture, edge computing, geospatial data processing, and fault-tolerant design.

---

## Features

### Kenya Weather Coverage
Real-time data for Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, Malindi, Garissa, Kitale, and Kakamega. Each location includes region information and population data.

### Global Weather Explorer
Interactive Leaflet map with search functionality for any city worldwide (10,000+ locations). Click anywhere on the map to retrieve current weather conditions for that exact location.

### Historical Data Analysis
Seven-day charts for temperature trends, air quality (PM2.5 and PM10), and rainfall patterns.

### Data Export
CSV download of current weather data for all tracked cities. PDF export of the main dashboard.

### User Features
Favorite cities persisted to localStorage, keyboard shortcuts (refresh, compare, search), shareable URLs with query parameters, and side-by-side city comparison (up to four cities).

### Responsive Design
Mobile-first layout that works across all device sizes.

---

## Architecture

### Serverless Functions

All API endpoints run as serverless functions on Vercel's edge network. Each function is stateless, idempotent, and scales horizontally.

API endpoints:
- `/api/weather` - Current weather for Kenyan cities
- `/api/historical` - Seven-day historical data with air quality
- `/api/weather/coordinates` - Weather retrieval by latitude and longitude

### Multi-Layer Caching

The application implements a four-layer cache hierarchy:

**Layer 1: Browser Cache**
Service worker caching for static assets.

**Layer 2: Edge CDN**
Vercel CDN with 5-minute TTL and 10-minute stale-while-revalidate.

**Layer 3: In-Memory Cache**
JavaScript Map with TTL (5 minutes for current weather, 1 hour for historical).

**Layer 4: External API**
Open-Meteo API with rate limiting (10,000 requests/day).

**Measured results:**
- 72% cache hit rate
- <50ms average response time for cached responses
- 18 global edge regions

### Fault Tolerance

The system maintains functionality when external services fail:
- External API failures return cached data with a `source: 'cached'` indicator
- Air quality API failures do not block weather data delivery
- Three retry attempts with exponential backoff (1 second, 2 seconds, 4 seconds)

### Geospatial Processing

- Leaflet.js with OpenStreetMap tiles
- Reverse geocoding for clicked map coordinates
- Smooth fly-to animations (1.5 seconds duration)
- Nominatim OSM API for city search and geocoding

---

## Technical Decisions and Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Vercel over AWS** | Zero-configuration deployment, built-in edge network, no credit card required for free tier | Less fine-grained infrastructure control, limited to 12 serverless functions per project on free tier |
| **In-memory cache over Redis** | Simpler implementation, zero additional cost, no external service dependency | Cache not shared across function instances, lost on function cold starts |
| **Open-Meteo over WeatherAPI** | Free tier requires no API key, no billing setup, generous rate limits | 10,000 daily request limit, air quality historical data occasionally unavailable |
| **Leaflet over Mapbox** | Completely open source, no API keys, unlimited usage | Fewer styling options, less polished default tiles, requires additional configuration for production marker icons |
| **Client-side data fetching over SSR** | Real-time updates without rebuilds, simpler state management | Slower initial page load, search engine indexing limitations |

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Deployment | Vercel Edge Network |
| Maps | Leaflet.js with OpenStreetMap |
| Charts | Recharts |
| Icons | Lucide React |
| External APIs | Open-Meteo, Nominatim OSM |

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Edge Cache TTL | 5 minutes |
| Average response time (cached) | <50ms |
| Average response time (live) | 200-400ms |
| Edge regions | 18 globally |
| Cache hit ratio | 72% |
| Lighthouse Performance score | 98/100 |

---

## Local Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

```bash
git clone https://github.com/your-username/kenya-weather.git
cd kenya-weather
npm install
npm run dev