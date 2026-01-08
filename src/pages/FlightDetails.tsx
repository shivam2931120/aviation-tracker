import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet'
import {
    Plane,
    ArrowLeft,
    Clock,
    Navigation,
    Gauge,
    Mountain,
    MapPin,
    Calendar,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Activity,
    Wifi,
    Battery,
    Thermometer,
    Wind,
    Eye,
    Star,
    Share2,
    BookmarkPlus,
    RefreshCw
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

interface FlightDetail {
    id: string
    callsign: string
    icao24: string
    airline: string
    aircraft: string
    registration: string
    origin: {
        iata: string
        name: string
        city: string
        country: string
        lat: number
        lng: number
    }
    destination: {
        iata: string
        name: string
        city: string
        country: string
        lat: number
        lng: number
    }
    currentPosition: {
        lat: number
        lng: number
        altitude: number
        speed: number
        heading: number
        verticalSpeed: number
    }
    status: 'scheduled' | 'boarding' | 'departed' | 'en-route' | 'landing' | 'landed' | 'delayed'
    progress: number
    departureTime: string
    arrivalTime: string
    flightTime: string
    remainingTime: string
    distance: number
    distanceRemaining: number
    pathHistory: Array<[number, number]>
}

// Mock flight detail data
const getMockFlightDetail = (id: string): FlightDetail => {
    const paths: Array<[number, number]> = []
    // Generate flight path from origin to current position
    for (let i = 0; i <= 20; i++) {
        const t = i / 20
        const lat = 40.6413 + (51.47 - 40.6413) * t * 0.6
        const lng = -73.7781 + (-0.4543 - (-73.7781)) * t * 0.6
        paths.push([lat, lng])
    }

    return {
        id,
        callsign: id.toUpperCase() || 'BA178',
        icao24: 'a1b2c3',
        airline: 'British Airways',
        aircraft: 'Boeing 777-300ER',
        registration: 'G-STBK',
        origin: {
            iata: 'JFK',
            name: 'John F. Kennedy International',
            city: 'New York',
            country: 'USA',
            lat: 40.6413,
            lng: -73.7781
        },
        destination: {
            iata: 'LHR',
            name: 'London Heathrow',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.47,
            lng: -0.4543
        },
        currentPosition: {
            lat: 47.5,
            lng: -30.5,
            altitude: 38000,
            speed: 485,
            heading: 65,
            verticalSpeed: 0
        },
        status: 'en-route',
        progress: 58,
        departureTime: '14:30 EST',
        arrivalTime: '02:45 GMT',
        flightTime: '7h 15m',
        remainingTime: '3h 02m',
        distance: 5541,
        distanceRemaining: 2327,
        pathHistory: paths
    }
}

export default function FlightDetails() {
    const { id } = useParams<{ id: string }>()
    const [flight, setFlight] = useState<FlightDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'path' | 'weather' | 'aircraft'>('overview')

    useEffect(() => {
        // Simulate API call
        setIsLoading(true)
        setTimeout(() => {
            setFlight(getMockFlightDetail(id || 'BA178'))
            setIsLoading(false)
        }, 500)
    }, [id])

    if (isLoading || !flight) {
        return (
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-8 h-8 text-aviation-red animate-spin" />
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'en-route': return 'bg-green-500'
            case 'delayed': return 'bg-yellow-500'
            case 'landed': return 'bg-blue-500'
            default: return 'bg-aviation-muted'
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 bg-aviation-darker rounded-lg border border-aviation-border hover:border-aviation-red transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-roboto-condensed text-2xl font-bold text-aviation-red">
                                {flight.callsign}
                            </h1>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(flight.status)} text-white`}>
                                {flight.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-aviation-muted text-sm">{flight.airline} • {flight.aircraft}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`p-2 rounded-lg border transition-colors ${isFollowing ? 'bg-aviation-red border-aviation-red' : 'bg-aviation-darker border-aviation-border hover:border-aviation-red'}`}
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-aviation-darker rounded-lg border border-aviation-border hover:border-aviation-red transition-colors">
                        <BookmarkPlus className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-aviation-darker rounded-lg border border-aviation-border hover:border-aviation-red transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Route Overview */}
            <motion.div
                className="card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between">
                    {/* Origin */}
                    <div className="text-center">
                        <p className="font-jetbrains text-3xl font-bold text-white">{flight.origin.iata}</p>
                        <p className="text-aviation-muted text-sm">{flight.origin.city}</p>
                        <p className="text-green-400 text-xs mt-1">{flight.departureTime}</p>
                    </div>

                    {/* Progress */}
                    <div className="flex-1 mx-8">
                        <div className="relative">
                            <div className="h-1 bg-aviation-border rounded-full">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-aviation-red to-green-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${flight.progress}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                            <motion.div
                                className="absolute top-1/2 -translate-y-1/2"
                                initial={{ left: 0 }}
                                animate={{ left: `${flight.progress}%` }}
                                transition={{ duration: 1 }}
                            >
                                <div className="relative -translate-x-1/2">
                                    <Plane className="w-6 h-6 text-aviation-red rotate-90" />
                                </div>
                            </motion.div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-aviation-muted">
                            <span>{flight.distance - flight.distanceRemaining} km</span>
                            <span className="text-green-400">{flight.progress}% complete</span>
                            <span>{flight.distanceRemaining} km remaining</span>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="text-center">
                        <p className="font-jetbrains text-3xl font-bold text-white">{flight.destination.iata}</p>
                        <p className="text-aviation-muted text-sm">{flight.destination.city}</p>
                        <p className="text-aviation-red text-xs mt-1">ETA: {flight.arrivalTime}</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 bg-aviation-darker rounded-lg p-1 w-fit">
                {['overview', 'path', 'weather', 'aircraft'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                                ? 'bg-aviation-red text-white'
                                : 'text-aviation-muted hover:text-white'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Map with Flight Path */}
                <motion.div
                    className="lg:col-span-2 card p-0 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="p-3 border-b border-aviation-border bg-aviation-darker/50">
                        <h3 className="font-roboto-condensed font-bold flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-aviation-red" />
                            Flight Path {isFollowing && <span className="text-xs text-green-400">(Following)</span>}
                        </h3>
                    </div>
                    <div className="h-[400px]">
                        <MapContainer
                            center={[flight.currentPosition.lat, flight.currentPosition.lng]}
                            zoom={4}
                            className="h-full w-full"
                            zoomControl={false}
                        >
                            <TileLayer
                                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                attribution='&copy; Stadia Maps'
                            />

                            {/* Flight path history */}
                            <Polyline
                                positions={flight.pathHistory}
                                pathOptions={{
                                    color: '#22c55e',
                                    weight: 3,
                                    opacity: 0.8,
                                    dashArray: '10, 5'
                                }}
                            />

                            {/* Remaining path (projected) */}
                            <Polyline
                                positions={[
                                    [flight.currentPosition.lat, flight.currentPosition.lng],
                                    [flight.destination.lat, flight.destination.lng]
                                ]}
                                pathOptions={{
                                    color: '#dc2626',
                                    weight: 2,
                                    opacity: 0.5,
                                    dashArray: '5, 10'
                                }}
                            />

                            {/* Origin */}
                            <CircleMarker
                                center={[flight.origin.lat, flight.origin.lng]}
                                radius={8}
                                pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.8 }}
                            >
                                <Popup>{flight.origin.iata} - {flight.origin.name}</Popup>
                            </CircleMarker>

                            {/* Current position */}
                            <CircleMarker
                                center={[flight.currentPosition.lat, flight.currentPosition.lng]}
                                radius={6}
                                pathOptions={{ color: '#ffffff', fillColor: '#dc2626', fillOpacity: 1, weight: 2 }}
                            >
                                <Popup>
                                    <strong>{flight.callsign}</strong><br />
                                    Alt: {flight.currentPosition.altitude.toLocaleString()} ft<br />
                                    Speed: {flight.currentPosition.speed} kts
                                </Popup>
                            </CircleMarker>

                            {/* Destination */}
                            <CircleMarker
                                center={[flight.destination.lat, flight.destination.lng]}
                                radius={8}
                                pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.8 }}
                            >
                                <Popup>{flight.destination.iata} - {flight.destination.name}</Popup>
                            </CircleMarker>
                        </MapContainer>
                    </div>
                </motion.div>

                {/* Stats Panel */}
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Current Status */}
                    <div className="card p-4">
                        <h3 className="font-roboto-condensed font-bold mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-aviation-red" />
                            Live Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-aviation-muted">
                                    <Mountain className="w-4 h-4" />
                                    <span className="text-sm">Altitude</span>
                                </div>
                                <span className="font-jetbrains text-white">
                                    {flight.currentPosition.altitude.toLocaleString()} ft
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-aviation-muted">
                                    <Gauge className="w-4 h-4" />
                                    <span className="text-sm">Ground Speed</span>
                                </div>
                                <span className="font-jetbrains text-white">
                                    {flight.currentPosition.speed} kts
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-aviation-muted">
                                    <Navigation className="w-4 h-4" />
                                    <span className="text-sm">Heading</span>
                                </div>
                                <span className="font-jetbrains text-white">
                                    {flight.currentPosition.heading}°
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-aviation-muted">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm">Vertical Speed</span>
                                </div>
                                <span className="font-jetbrains text-white">
                                    {flight.currentPosition.verticalSpeed} fpm
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Time Info */}
                    <div className="card p-4">
                        <h3 className="font-roboto-condensed font-bold mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-aviation-red" />
                            Time Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-aviation-muted">Flight Time</span>
                                <span className="font-jetbrains text-white">{flight.flightTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-aviation-muted">Remaining</span>
                                <span className="font-jetbrains text-green-400">{flight.remainingTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-aviation-muted">Distance</span>
                                <span className="font-jetbrains text-white">{flight.distance.toLocaleString()} km</span>
                            </div>
                        </div>
                    </div>

                    {/* Aircraft Info */}
                    <div className="card p-4">
                        <h3 className="font-roboto-condensed font-bold mb-3 flex items-center gap-2">
                            <Plane className="w-4 h-4 text-aviation-red" />
                            Aircraft
                        </h3>
                        <div className="space-y-2">
                            <p className="text-white font-medium">{flight.aircraft}</p>
                            <p className="text-aviation-muted text-sm">Registration: {flight.registration}</p>
                            <p className="text-aviation-muted text-sm">ICAO24: {flight.icao24}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
