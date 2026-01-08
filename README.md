# Aviation Reliability Tracker

A real-time aviation tracking and reliability prediction platform built with React, Vite, Prisma, and Vercel serverless functions.

![Theme](https://img.shields.io/badge/Theme-Black%20%2B%20Red-dc2626)
![Framework](https://img.shields.io/badge/Framework-React%20%2B%20Vite-61dafb)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-336791)
![Deployment](https://img.shields.io/badge/Deployment-Vercel-000000)

## 🛫 Features

- **Real-time Flight Tracking** - Live map with aircraft positions
- **Airport Analytics** - On-time performance, delay statistics, incident tracking
- **Route Reliability** - Reliability scores with historical analysis
- **Delay Prediction** - ML-based prediction with AI explanation
- **Reports & Exports** - PDF, CSV, XLSX report generation
- **Black + Red Theme** - Aviation-inspired dark UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon or Supabase)
- npm or yarn

### Installation

```bash
# Clone or navigate to project
cd aviation-tracker

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Ubuntu One-Command Setup

```bash
chmod +x ubuntu_scripts/run.sh
./ubuntu_scripts/run.sh
```

## 📁 Project Structure

```
aviation-tracker/
├── api/                    # Vercel serverless functions
│   ├── airports.ts         # Airport listing & search
│   ├── routes.ts           # Route reliability data
│   ├── flights.ts          # Flight listing
│   ├── flight/[id].ts      # Flight details
│   ├── predict_delay.ts    # ML delay prediction
│   ├── analytics.ts        # Analytics data
│   └── reports.ts          # Report generation
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data
├── src/
│   ├── components/         # React components
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navbar.tsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Airports.tsx
│   │   ├── Routes.tsx
│   │   ├── FlightDetails.tsx
│   │   ├── Analytics.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   └── api.ts          # API client
│   └── styles/
│       └── globals.css     # Theme styles
├── ubuntu_scripts/
│   └── run.sh              # Setup script
└── vercel.json             # Vercel configuration
```

## 🎨 Design System

### Colors
- **Background**: `#000000` (black)
- **Secondary**: `#0a0a0a` (dark gray)
- **Accent**: `#dc2626` (red)
- **Text**: `#ffffff` (white)
- **Muted**: `#a3a3a3` (gray)

### Typography
| Font | Usage |
|------|-------|
| Roboto Condensed | Aviation headings |
| Inter | Body text |
| Source Sans 3 | Tables |
| JetBrains Mono | ICAO codes, callsigns |

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/airports` | GET | List airports with search/pagination |
| `/api/routes` | GET | Route reliability rankings |
| `/api/flights` | GET | List flights with filters |
| `/api/flight/:id` | GET | Flight details with history |
| `/api/predict_delay` | POST | Delay prediction |
| `/api/analytics` | GET | Analytics data |
| `/api/reports` | GET | Generate reports |

## 📊 Delay Prediction Formula

```
reliability_score = 0.5 * airlineOtp 
                  + 0.3 * airportOtp 
                  - 0.2 * weatherRisk 
                  + 0.1 * turnaroundFactor
```

## 🌐 Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Production deployment
vercel --prod
```

### Environment Variables

Set these in Vercel dashboard:

```
DATABASE_URL=postgresql://...
AVIATIONSTACK_API_KEY=your_key
OPENSKY_CLIENT_ID=your_client_id
OPENSKY_CLIENT_SECRET=your_secret
FLIGHTAPI_KEY=your_key
```

## 📄 License

MIT License - See LICENSE file for details.

---

Built with ❤️ for aviation enthusiasts
