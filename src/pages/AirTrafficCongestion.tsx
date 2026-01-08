import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import {
    Activity,
    AlertTriangle,
    Clock,
    TrendingUp,
    TrendingDown,
    Plane,
    Users,
    BarChart2,
    RefreshCw
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

interface AirportCongestion {
    iata: string
    name: string
    city: string
    country: string
    lat: number
    lng: number
    currentTraffic: number
    averageTraffic: number
    congestionLevel: 'low' | 'moderate' | 'high' | 'severe'
    delayMinutes: number
    trend: 'increasing' | 'stable' | 'decreasing'
    departures: number
    arrivals: number
}

// Mock congestion data
const mockCongestionData: AirportCongestion[] = [
    { iata: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781, currentTraffic: 145, averageTraffic: 120, congestionLevel: 'high', delayMinutes: 25, trend: 'increasing', departures: 78, arrivals: 67 },
    { iata: 'LAX', name: 'Los Angeles', city: 'Los Angeles', country: 'USA', lat: 33.9425, lng: -118.4081, currentTraffic: 132, averageTraffic: 115, congestionLevel: 'moderate', delayMinutes: 15, trend: 'stable', departures: 70, arrivals: 62 },
    { iata: 'ORD', name: "O'Hare", city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073, currentTraffic: 178, averageTraffic: 140, congestionLevel: 'severe', delayMinutes: 45, trend: 'increasing', departures: 95, arrivals: 83 },
    { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', lat: 51.47, lng: -0.4543, currentTraffic: 110, averageTraffic: 105, congestionLevel: 'low', delayMinutes: 8, trend: 'stable', departures: 58, arrivals: 52 },
    { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, currentTraffic: 125, averageTraffic: 110, congestionLevel: 'moderate', delayMinutes: 18, trend: 'decreasing', departures: 65, arrivals: 60 },
    { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, currentTraffic: 98, averageTraffic: 95, congestionLevel: 'low', delayMinutes: 5, trend: 'stable', departures: 52, arrivals: 46 },
    { iata: 'DXB', name: 'Dubai', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657, currentTraffic: 156, averageTraffic: 130, congestionLevel: 'high', delayMinutes: 22, trend: 'increasing', departures: 82, arrivals: 74 },
    { iata: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, currentTraffic: 88, averageTraffic: 90, congestionLevel: 'low', delayMinutes: 3, trend: 'stable', departures: 45, arrivals: 43 },
    { iata: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan', lat: 35.5494, lng: 139.7798, currentTraffic: 142, averageTraffic: 125, congestionLevel: 'moderate', delayMinutes: 12, trend: 'decreasing', departures: 75, arrivals: 67 },
    { iata: 'ATL', name: 'Atlanta', city: 'Atlanta', country: 'USA', lat: 33.6407, lng: -84.4277, currentTraffic: 195, averageTraffic: 150, congestionLevel: 'severe', delayMinutes: 55, trend: 'increasing', departures: 105, arrivals: 90 },
]

export default function AirTrafficCongestion() {
    const [airports, setAirports] = useState<AirportCongestion[]>(mockCongestionData)
    const [selectedAirport, setSelectedAirport] = useState<AirportCongestion | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const getCongestionColor = (level: string) => {
        switch (level) {
            case 'low': return '#22c55e'
            case 'moderate': return '#eab308'
            case 'high': return '#f97316'
            case 'severe': return '#dc2626'
            default: return '#6b7280'
        }
    }

    const getCongestionBg = (level: string) => {
        switch (level) {
            case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            case 'severe': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />
            case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-400" />
            default: return <Activity className="w-4 h-4 text-yellow-400" />
        }
    }

    // Stats
    const severeCount = airports.filter(a => a.congestionLevel === 'severe').length
    const highCount = airports.filter(a => a.congestionLevel === 'high').length
    const avgDelay = Math.round(airports.reduce((sum, a) => sum + a.delayMinutes, 0) / airports.length)
    const totalTraffic = airports.reduce((sum, a) => sum + a.currentTraffic, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-roboto-condensed text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-aviation-red" />
                        Air Traffic Congestion
                    </h1>
                    <p className="text-aviation-muted text-sm">Real-time airport congestion monitoring</p>
                </div>
                <button
                    onClick={() => setIsLoading(true)}
                    className="btn-primary"
                    disabled={isLoading}
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Alert Banner */}
            {severeCount > 0 && (
                <motion.div
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <div>
                        <p className="text-red-400 font-medium">Severe Congestion Alert</p>
                        <p className="text-red-400/70 text-sm">
                            {severeCount} airport{severeCount > 1 ? 's' : ''} experiencing severe delays ({airports.filter(a => a.congestionLevel === 'severe').map(a => a.iata).join(', ')})
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-red-400">{severeCount + highCount}</p>
                            <p className="text-aviation-muted text-xs">High/Severe Congestion</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-yellow-400">{avgDelay} min</p>
                            <p className="text-aviation-muted text-xs">Avg Delay</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Plane className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-blue-400">{totalTraffic}</p>
                            <p className="text-aviation-muted text-xs">Active Flights</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-green-400">{airports.length}</p>
                            <p className="text-aviation-muted text-xs">Airports Monitored</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Map */}
                <motion.div
                    className="lg:col-span-2 card p-0 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="p-3 border-b border-aviation-border bg-aviation-darker/50">
                        <h3 className="font-roboto-condensed font-bold flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-aviation-red" />
                            Congestion Map
                        </h3>
                    </div>
                    <div className="h-[400px]">
                        <MapContainer
                            center={[30, 0]}
                            zoom={2}
                            className="h-full w-full"
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                            />
                            {airports.map(airport => (
                                <CircleMarker
                                    key={airport.iata}
                                    center={[airport.lat, airport.lng]}
                                    radius={8 + airport.currentTraffic / 20}
                                    pathOptions={{
                                        color: getCongestionColor(airport.congestionLevel),
                                        fillColor: getCongestionColor(airport.congestionLevel),
                                        fillOpacity: 0.6,
                                        weight: 2
                                    }}
                                    eventHandlers={{
                                        click: () => setSelectedAirport(airport)
                                    }}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <strong className="text-lg">{airport.iata}</strong>
                                            <p>{airport.name}</p>
                                            <p className="text-gray-500">{airport.city}, {airport.country}</p>
                                            <p className="mt-2">
                                                <span className={airport.congestionLevel === 'severe' || airport.congestionLevel === 'high' ? 'text-red-600' : 'text-yellow-600'}>
                                                    {airport.congestionLevel.toUpperCase()}
                                                </span> - {airport.delayMinutes} min avg delay
                                            </p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                    {/* Legend */}
                    <div className="p-3 bg-aviation-darker/50 border-t border-aviation-border flex items-center gap-4 text-xs">
                        <span className="text-aviation-muted">Congestion:</span>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Low</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span>Moderate</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span>High</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Severe</span>
                        </div>
                    </div>
                </motion.div>

                {/* Airport List */}
                <motion.div
                    className="card overflow-hidden"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="p-3 border-b border-aviation-border bg-aviation-darker/50">
                        <h3 className="font-roboto-condensed font-bold">Airport Status</h3>
                    </div>
                    <div className="divide-y divide-aviation-border max-h-[500px] overflow-y-auto">
                        {airports.sort((a, b) => b.delayMinutes - a.delayMinutes).map((airport, i) => (
                            <motion.div
                                key={airport.iata}
                                className={`p-3 hover:bg-aviation-dark/50 cursor-pointer transition-colors ${selectedAirport?.iata === airport.iata ? 'bg-aviation-dark' : ''
                                    }`}
                                onClick={() => setSelectedAirport(airport)}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.03 }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-jetbrains font-bold text-white">{airport.iata}</span>
                                        {getTrendIcon(airport.trend)}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] border ${getCongestionBg(airport.congestionLevel)}`}>
                                        {airport.congestionLevel.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-aviation-muted text-xs mb-2">{airport.city}</p>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-aviation-muted">{airport.currentTraffic} flights</span>
                                    <span className={airport.delayMinutes > 20 ? 'text-red-400' : 'text-yellow-400'}>
                                        {airport.delayMinutes} min delay
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-2 h-1 bg-aviation-border rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${(airport.currentTraffic / 200) * 100}%`,
                                            backgroundColor: getCongestionColor(airport.congestionLevel)
                                        }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
