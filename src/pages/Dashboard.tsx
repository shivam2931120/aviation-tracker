import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import {
    Plane,
    TrendingUp,
    Activity,
    Search,
    RefreshCw,
    Globe,
    Zap,
    Map,
    Box,
    Flame,
    Route,
    Menu,
    X
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { fetchLiveFlights, calculateFlightStats, Flight } from '../lib/aviationApi'
import HeatmapLayer from '../components/HeatmapLayer'
import { AnimatedFlightPaths } from '../components/AnimatedFlightPath'
import Globe3D from '../components/Globe3D'

// Airports data
const allAirports = [
    { iata: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781, otp: 74.2 },
    { iata: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', lat: 33.9425, lng: -118.4081, otp: 76.8 },
    { iata: 'ORD', name: "O'Hare Intl", city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073, otp: 71.5 },
    { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', lat: 51.47, lng: -0.4543, otp: 78.3 },
    { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, otp: 76.5 },
    { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, otp: 80.1 },
    { iata: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683, otp: 79.2 },
    { iata: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657, otp: 82.5 },
    { iata: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan', lat: 35.5494, lng: 139.7798, otp: 88.5 },
    { iata: 'SIN', name: 'Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, otp: 85.8 },
    { iata: 'ICN', name: 'Incheon', city: 'Seoul', country: 'South Korea', lat: 37.4602, lng: 126.4407, otp: 84.5 },
    { iata: 'HKG', name: 'Hong Kong', city: 'Hong Kong', country: 'China', lat: 22.308, lng: 113.9185, otp: 81.2 },
    { iata: 'SYD', name: 'Sydney', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753, otp: 79.5 },
    { iata: 'ATL', name: 'Atlanta', city: 'Atlanta', country: 'USA', lat: 33.6407, lng: -84.4277, otp: 77.8 },
    { iata: 'DFW', name: 'Dallas', city: 'Dallas', country: 'USA', lat: 32.8998, lng: -97.0403, otp: 79.5 },
    { iata: 'DEN', name: 'Denver', city: 'Denver', country: 'USA', lat: 39.8561, lng: -104.6737, otp: 75.2 },
    { iata: 'SFO', name: 'San Francisco', city: 'San Francisco', country: 'USA', lat: 37.6213, lng: -122.379, otp: 73.8 },
    { iata: 'MIA', name: 'Miami', city: 'Miami', country: 'USA', lat: 25.7959, lng: -80.287, otp: 76.2 },
    { iata: 'SEA', name: 'Seattle', city: 'Seattle', country: 'USA', lat: 47.4502, lng: -122.3088, otp: 78.5 },
    { iata: 'BOS', name: 'Boston', city: 'Boston', country: 'USA', lat: 42.3656, lng: -71.0096, otp: 74.8 },
    { iata: 'PEK', name: 'Beijing', city: 'Beijing', country: 'China', lat: 40.0799, lng: 116.6031, otp: 72.5 },
    { iata: 'DEL', name: 'Delhi', city: 'Delhi', country: 'India', lat: 28.5562, lng: 77.1, otp: 75.8 },
    { iata: 'DOH', name: 'Doha', city: 'Doha', country: 'Qatar', lat: 25.2609, lng: 51.6138, otp: 84.2 },
    { iata: 'IST', name: 'Istanbul', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lng: 28.7519, otp: 77.8 },
    { iata: 'MUC', name: 'Munich', city: 'Munich', country: 'Germany', lat: 48.3537, lng: 11.775, otp: 81.5 },
]

// Sample animated routes
const animatedRoutes = [
    { origin: { lat: 40.6413, lng: -73.7781 }, destination: { lat: 51.47, lng: -0.4543 }, color: '#dc2626' },
    { origin: { lat: 33.9425, lng: -118.4081 }, destination: { lat: 35.5494, lng: 139.7798 }, color: '#22c55e' },
    { origin: { lat: 25.2532, lng: 55.3657 }, destination: { lat: 1.3644, lng: 103.9915 }, color: '#eab308' },
    { origin: { lat: 51.47, lng: -0.4543 }, destination: { lat: 25.2532, lng: 55.3657 }, color: '#3b82f6' },
    { origin: { lat: 49.0097, lng: 2.5479 }, destination: { lat: 40.6413, lng: -73.7781 }, color: '#8b5cf6' },
]

const createAircraftIcon = (rotation: number = 0) => {
    return L.divIcon({
        className: 'custom-aircraft-icon',
        html: `<div style="transform: rotate(${rotation}deg);"><svg width="12" height="12" viewBox="0 0 24 24" fill="#22c55e"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    })
}

export default function Dashboard() {
    const [flights, setFlights] = useState<Flight[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [stats, setStats] = useState<any>(null)
    const [viewMode, setViewMode] = useState<'map' | 'globe' | 'heatmap' | 'routes'>('map')
    const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [showFlightList, setShowFlightList] = useState(true)
    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const loadFlightData = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true)
        setIsRefreshing(true)
        try {
            const liveFlights = await fetchLiveFlights()
            if (liveFlights.length > 0) {
                setFlights(liveFlights)
                setStats(calculateFlightStats(liveFlights))
                setDataSource('live')
                setLastUpdate(new Date())
            } else {
                setDataSource('mock')
                generateMockFlights()
            }
        } catch (error) {
            setDataSource('mock')
            generateMockFlights()
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    const generateMockFlights = () => {
        const mockFlights: Flight[] = []
        const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'UAE', 'Singapore', 'Australia', 'Canada', 'Brazil', 'India', 'China']
        for (let i = 0; i < 300; i++) {
            mockFlights.push({
                id: `mock-${i}`,
                icao24: Math.random().toString(16).slice(2, 8),
                callsign: `${['AA', 'UA', 'DL', 'BA', 'LH', 'AF', 'EK', 'SQ', 'QR', 'JL'][i % 10]}${100 + i}`,
                originCountry: countries[i % countries.length],
                latitude: (Math.random() - 0.5) * 140 + 20,
                longitude: (Math.random() - 0.5) * 300,
                altitude: 25000 + Math.random() * 15000,
                velocity: 400 + Math.random() * 150,
                trueTrack: Math.random() * 360,
                onGround: Math.random() > 0.95,
                status: Math.random() > 0.95 ? 'grounded' : 'active'
            })
        }
        setFlights(mockFlights)
        setStats(calculateFlightStats(mockFlights))
        setLastUpdate(new Date())
    }

    useEffect(() => {
        loadFlightData()
        refreshIntervalRef.current = setInterval(() => loadFlightData(false), 30000)
        return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current) }
    }, [loadFlightData])

    const filteredFlights = flights.filter(f => {
        const matchesSearch = searchQuery === '' || f.callsign.toLowerCase().includes(searchQuery.toLowerCase()) || f.originCountry.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && !f.onGround) || (statusFilter === 'grounded' && f.onGround)
        return matchesSearch && matchesStatus
    })

    const activeFlights = flights.filter(f => !f.onGround)

    // Heatmap data from flight positions
    const heatmapData: Array<[number, number, number]> = activeFlights.map(f => [f.latitude, f.longitude, 0.5 + Math.random() * 0.5])

    const globeAirports = allAirports.map(a => ({ lat: a.lat, lng: a.lng, label: `${a.iata} - ${a.name}`, type: 'airport' as const }))
    const globeFlights = activeFlights.slice(0, 200).map(f => ({ lat: f.latitude, lng: f.longitude, label: f.callsign, type: 'flight' as const, data: f }))

    const statCards = [
        { label: 'Active Flights', value: stats?.active?.toLocaleString() || '0', icon: Plane, color: 'text-green-400' },
        { label: 'Airports', value: allAirports.length.toString(), icon: Globe, color: 'text-aviation-red' },
        { label: 'Avg Speed', value: stats?.avgSpeed ? `${stats.avgSpeed}kts` : '--', icon: Zap, color: 'text-yellow-400' },
        { label: 'Avg Alt', value: stats?.avgAltitude ? `${(stats.avgAltitude / 1000).toFixed(0)}k` : '--', icon: TrendingUp, color: 'text-blue-400' },
    ]

    return (
        <div className="space-y-3 md:space-y-4">
            {/* Mobile Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button className="lg:hidden p-2 bg-aviation-darker rounded-lg border border-aviation-border" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="w-5 h-5 text-aviation-muted" /> : <Menu className="w-5 h-5 text-aviation-muted" />}
                    </button>
                    <div>
                        <h1 className="font-roboto-condensed text-lg md:text-2xl font-bold flex items-center gap-2">
                            Dashboard
                            <span className={`px-1.5 py-0.5 text-[10px] md:text-xs rounded ${dataSource === 'live' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                {dataSource === 'live' ? 'LIVE' : 'DEMO'}
                            </span>
                        </h1>
                        <p className="text-aviation-muted text-[10px] md:text-sm hidden sm:block">
                            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                    {/* View Mode Toggle - Responsive */}
                    <div className="flex bg-aviation-darker rounded-lg border border-aviation-border overflow-hidden">
                        {[
                            { mode: 'map', icon: Map, label: 'Map' },
                            { mode: 'heatmap', icon: Flame, label: 'Heat' },
                            { mode: 'routes', icon: Route, label: 'Routes' },
                            { mode: 'globe', icon: Box, label: '3D' },
                        ].map(({ mode, icon: Icon, label }) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode as any)}
                                className={`p-1.5 md:p-2 transition-colors ${viewMode === mode ? 'bg-aviation-red text-white' : 'text-aviation-muted hover:text-white'}`}
                                title={label}
                            >
                                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        ))}
                    </div>
                    <button onClick={() => loadFlightData()} disabled={isRefreshing} className="btn-primary !py-1.5 !px-2 md:!py-2 md:!px-3">
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <motion.div key={stat.label} className="card p-2 md:p-3 shadow-3d" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] md:text-xs text-aviation-muted">{stat.label}</p>
                                    <p className={`text-lg md:text-2xl font-roboto-condensed font-bold ${stat.color}`}>
                                        {isLoading ? '...' : stat.value}
                                    </p>
                                </div>
                                <div className={`p-1.5 md:p-2 rounded-lg bg-aviation-darker border border-aviation-border ${stat.color}`}>
                                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Main Content - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                {/* Map Panel */}
                <motion.div className={`${showFlightList ? 'lg:col-span-2' : 'lg:col-span-3'} card p-0 overflow-hidden`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="p-2 md:p-3 border-b border-aviation-border flex items-center justify-between bg-aviation-darker/50">
                        <div className="flex items-center gap-2">
                            <h2 className="font-roboto-condensed font-bold text-sm md:text-base">
                                {viewMode === 'globe' ? '3D Globe' : viewMode === 'heatmap' ? 'Traffic Density' : viewMode === 'routes' ? 'Flight Routes' : 'Flight Map'}
                            </h2>
                            <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] md:text-xs rounded border border-green-500/20">
                                {activeFlights.length}
                            </span>
                        </div>
                        <button className="lg:hidden p-1.5 bg-aviation-darker rounded border border-aviation-border" onClick={() => setShowFlightList(!showFlightList)}>
                            <Activity className="w-4 h-4 text-aviation-muted" />
                        </button>
                    </div>
                    <div className="h-[300px] sm:h-[400px] md:h-[450px] relative bg-black">
                        {viewMode === 'globe' ? (
                            <Globe3D airports={globeAirports} flights={globeFlights} />
                        ) : (
                            <MapContainer center={[20, 0]} zoom={2} className="h-full w-full" minZoom={1} maxZoom={10} zoomControl={false}>
                                {/* Using Stadia Maps dark theme - more visible than CartoDB */}
                                <TileLayer
                                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; Stadia Maps'
                                />

                                {/* Heatmap Layer */}
                                {viewMode === 'heatmap' && <HeatmapLayer points={heatmapData} options={{ radius: 25, blur: 20, max: 1.0 }} />}

                                {/* Animated Routes */}
                                {viewMode === 'routes' && <AnimatedFlightPaths routes={animatedRoutes} />}

                                {/* Airport markers - larger with glow effect */}
                                {(viewMode === 'map' || viewMode === 'routes') && allAirports.map((a) => (
                                    <CircleMarker
                                        key={a.iata}
                                        center={[a.lat, a.lng]}
                                        radius={5}
                                        pathOptions={{
                                            color: '#ff4444',
                                            fillColor: '#dc2626',
                                            fillOpacity: 0.9,
                                            weight: 2
                                        }}
                                    >
                                        <Popup>
                                            <div className="text-xs p-1">
                                                <strong className="text-red-600 text-sm">{a.iata}</strong>
                                                <br />
                                                <span className="text-gray-700">{a.name}</span>
                                                <br />
                                                <span className="text-gray-500">{a.city}, {a.country}</span>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}

                                {/* Flight markers */}
                                {viewMode === 'map' && activeFlights.slice(0, 300).map((f) => (
                                    <Marker key={f.id} position={[f.latitude, f.longitude]} icon={createAircraftIcon(f.trueTrack || 0)}>
                                        <Popup>
                                            <div className="text-xs p-1">
                                                <strong className="text-green-600 text-sm">{f.callsign}</strong>
                                                <br />
                                                <span className="text-gray-700">{f.originCountry}</span>
                                                <br />
                                                <span className="text-gray-500">
                                                    Alt: {f.altitude ? `${(f.altitude / 1000).toFixed(1)}k ft` : 'N/A'} |
                                                    Speed: {f.velocity ? `${Math.round(f.velocity)} kts` : 'N/A'}
                                                </span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        )}

                        {/* View mode legend */}
                        <div className="absolute bottom-2 left-2 bg-aviation-dark/90 backdrop-blur rounded-lg px-2 py-1 text-[10px] text-aviation-muted border border-aviation-border">
                            {viewMode === 'heatmap' && '🔥 Brighter = More Traffic'}
                            {viewMode === 'routes' && '✈️ Animated Flight Paths'}
                            {viewMode === 'map' && `🟢 ${activeFlights.length} Active`}
                            {viewMode === 'globe' && '🌐 Drag to rotate'}
                        </div>
                    </div>
                </motion.div>

                {/* Flight List - Mobile Collapsible */}
                <AnimatePresence>
                    {showFlightList && (
                        <motion.div
                            className="space-y-2 md:space-y-3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-aviation-muted" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field w-full pl-8 py-2 text-sm"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex gap-1">
                                {['all', 'active', 'grounded'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`flex-1 px-2 py-1 rounded-lg text-[10px] md:text-xs font-medium ${statusFilter === s ? 'bg-aviation-red text-white' : 'bg-aviation-darker border border-aviation-border text-aviation-muted'}`}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <p className="text-xs text-aviation-muted">Flights ({filteredFlights.length})</p>

                            <div className="space-y-1 max-h-[250px] md:max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                                {isLoading ? (
                                    <div className="py-6 text-center"><RefreshCw className="w-5 h-5 animate-spin mx-auto text-aviation-muted" /></div>
                                ) : (
                                    filteredFlights.slice(0, 20).map((f, i) => (
                                        <motion.div
                                            key={f.id}
                                            className="card p-2 hover-lift cursor-pointer"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-jetbrains font-bold text-aviation-red text-sm">{f.callsign || f.icao24}</p>
                                                    <p className="text-[10px] text-aviation-muted">{f.originCountry}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-jetbrains text-xs text-white">{f.altitude ? `${(f.altitude / 1000).toFixed(0)}k ft` : '--'}</p>
                                                    <p className="font-jetbrains text-[10px] text-aviation-muted">{f.velocity ? `${f.velocity}kts` : '--'}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Stats - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <motion.div className="card p-3 md:p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 className="font-roboto-condensed font-bold text-sm md:text-base mb-2 md:mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-aviation-red" />
                        Top Countries
                    </h3>
                    <div className="space-y-1.5 md:space-y-2">
                        {(stats?.topCountries || []).slice(0, 4).map((c: [string, number], i: number) => (
                            <div key={c[0]} className="flex items-center gap-2">
                                <span className="text-[10px] text-aviation-muted w-3">{i + 1}.</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-0.5">
                                        <span className="text-xs md:text-sm text-white truncate">{c[0]}</span>
                                        <span className="font-jetbrains text-xs text-aviation-red">{c[1]}</span>
                                    </div>
                                    <div className="h-1 bg-aviation-darker rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-gradient-to-r from-aviation-red to-red-400" initial={{ width: 0 }} animate={{ width: `${(c[1] / (stats?.topCountries?.[0]?.[1] || 1)) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="card p-3 md:p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h3 className="font-roboto-condensed font-bold text-sm md:text-base mb-2 md:mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        Major Hubs
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                        {allAirports.slice(0, 6).map((a) => (
                            <div key={a.iata} className="flex items-center justify-between p-1.5 md:p-2 bg-aviation-darker rounded-lg">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-jetbrains text-aviation-red font-bold text-xs">{a.iata}</span>
                                    <span className="text-[10px] text-aviation-muted hidden sm:inline">{a.city}</span>
                                </div>
                                <span className={`font-jetbrains text-[10px] ${a.otp >= 80 ? 'text-green-400' : a.otp >= 75 ? 'text-yellow-400' : 'text-red-400'}`}>{a.otp}%</span>
                            </div>
                        ))}
                    </div>
                    <Link to="/airports" className="block text-center text-aviation-red text-[10px] md:text-xs hover:underline mt-2">View All →</Link>
                </motion.div>
            </div>
        </div>
    )
}
