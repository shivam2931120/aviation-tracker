import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import {
    ArrowLeft,
    Plane,
    Clock,
    Building2,
    Users,
    TrendingUp,
    Calendar,
    MapPin,
    Wifi,
    Coffee,
    ShoppingBag,
    Car,
    ExternalLink,
    Star,
    Navigation
} from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface AirportDetail {
    iata: string
    icao: string
    name: string
    city: string
    country: string
    lat: number
    lng: number
    timezone: string
    terminals: number
    gates: number
    runways: number
    elevation: number
    website: string
    phone: string
    stats: {
        dailyFlights: number
        annualPassengers: number
        onTimePerformance: number
        avgDelay: number
    }
    amenities: string[]
    airlines: string[]
    destinations: number
    recentFlights: Array<{
        callsign: string
        destination: string
        time: string
        status: 'on-time' | 'delayed' | 'departed'
    }>
}

// Mock airport data
const getAirportDetail = (iata: string): AirportDetail => {
    const airports: Record<string, Partial<AirportDetail>> = {
        'JFK': {
            iata: 'JFK',
            icao: 'KJFK',
            name: 'John F. Kennedy International Airport',
            city: 'New York',
            country: 'United States',
            lat: 40.6413,
            lng: -73.7781,
            timezone: 'America/New_York',
            terminals: 6,
            gates: 128,
            runways: 4,
            elevation: 13,
            website: 'https://www.jfkairport.com',
            phone: '+1 718-244-4444',
            stats: {
                dailyFlights: 1200,
                annualPassengers: 62000000,
                onTimePerformance: 78,
                avgDelay: 18
            },
            amenities: ['WiFi', 'Lounges', 'Shopping', 'Restaurants', 'Currency Exchange', 'Car Rental'],
            airlines: ['American Airlines', 'Delta', 'JetBlue', 'British Airways', 'Emirates', 'Lufthansa'],
            destinations: 185
        },
        'LHR': {
            iata: 'LHR',
            icao: 'EGLL',
            name: 'London Heathrow Airport',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.47,
            lng: -0.4543,
            timezone: 'Europe/London',
            terminals: 4,
            gates: 115,
            runways: 2,
            elevation: 83,
            website: 'https://www.heathrow.com',
            phone: '+44 844-335-1801',
            stats: {
                dailyFlights: 1300,
                annualPassengers: 80000000,
                onTimePerformance: 82,
                avgDelay: 12
            },
            amenities: ['WiFi', 'Lounges', 'Shopping', 'Restaurants', 'Hotels', 'Spa'],
            airlines: ['British Airways', 'Virgin Atlantic', 'American Airlines', 'United', 'Emirates'],
            destinations: 214
        }
    }

    const airport = airports[iata.toUpperCase()] || airports['JFK']

    return {
        ...airport,
        recentFlights: [
            { callsign: 'BA178', destination: 'LHR', time: '14:30', status: 'on-time' },
            { callsign: 'AA100', destination: 'LHR', time: '15:00', status: 'delayed' },
            { callsign: 'DL1', destination: 'CDG', time: '15:15', status: 'departed' },
            { callsign: 'EK203', destination: 'DXB', time: '16:00', status: 'on-time' },
            { callsign: 'UA1', destination: 'SFO', time: '16:30', status: 'on-time' },
        ]
    } as AirportDetail
}

const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
        case 'wifi': return <Wifi className="w-4 h-4" />
        case 'lounges': return <Coffee className="w-4 h-4" />
        case 'shopping': return <ShoppingBag className="w-4 h-4" />
        case 'car rental': return <Car className="w-4 h-4" />
        default: return <Star className="w-4 h-4" />
    }
}

export default function AirportDetail() {
    const { iata } = useParams<{ iata: string }>()
    const [airport, setAirport] = useState<AirportDetail | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'flights' | 'map'>('overview')

    useEffect(() => {
        setAirport(getAirportDetail(iata || 'JFK'))
    }, [iata])

    if (!airport) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-8 h-8 border-2 border-aviation-red border-t-transparent rounded-full" />
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'on-time': return 'text-green-400'
            case 'delayed': return 'text-yellow-400'
            case 'departed': return 'text-blue-400'
            default: return 'text-aviation-muted'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/airports" className="p-2 bg-aviation-darker rounded-lg border border-aviation-border hover:border-aviation-red transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="font-roboto-condensed text-2xl font-bold">
                            <span className="text-aviation-red">{airport.iata}</span> / {airport.icao}
                        </h1>
                    </div>
                    <p className="text-aviation-muted">{airport.name}</p>
                </div>
                <a
                    href={airport.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                >
                    <ExternalLink className="w-4 h-4" />
                    Website
                </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-aviation-red/20 rounded-lg">
                            <Plane className="w-5 h-5 text-aviation-red" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed">{airport.stats.dailyFlights}</p>
                            <p className="text-aviation-muted text-xs">Daily Flights</p>
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
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-green-400">{airport.stats.onTimePerformance}%</p>
                            <p className="text-aviation-muted text-xs">On-Time</p>
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
                            <Navigation className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-blue-400">{airport.destinations}</p>
                            <p className="text-aviation-muted text-xs">Destinations</p>
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
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-yellow-400">{airport.stats.avgDelay}m</p>
                            <p className="text-aviation-muted text-xs">Avg Delay</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-aviation-darker rounded-lg p-1 w-fit">
                {['overview', 'flights', 'map'].map((tab) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            {/* Info Grid */}
                            <motion.div
                                className="card p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h3 className="font-roboto-condensed font-bold mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-aviation-red" />
                                    Airport Information
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-aviation-muted text-xs">Location</p>
                                        <p className="text-white">{airport.city}, {airport.country}</p>
                                    </div>
                                    <div>
                                        <p className="text-aviation-muted text-xs">Timezone</p>
                                        <p className="text-white font-jetbrains text-sm">{airport.timezone}</p>
                                    </div>
                                    <div>
                                        <p className="text-aviation-muted text-xs">Elevation</p>
                                        <p className="text-white">{airport.elevation} ft</p>
                                    </div>
                                    <div>
                                        <p className="text-aviation-muted text-xs">Terminals</p>
                                        <p className="text-white">{airport.terminals}</p>
                                    </div>
                                    <div>
                                        <p className="text-aviation-muted text-xs">Gates</p>
                                        <p className="text-white">{airport.gates}</p>
                                    </div>
                                    <div>
                                        <p className="text-aviation-muted text-xs">Runways</p>
                                        <p className="text-white">{airport.runways}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Amenities */}
                            <motion.div
                                className="card p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h3 className="font-roboto-condensed font-bold mb-4">Amenities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {airport.amenities.map(amenity => (
                                        <span key={amenity} className="flex items-center gap-1.5 px-3 py-1.5 bg-aviation-dark rounded-lg text-sm">
                                            {getAmenityIcon(amenity)}
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Airlines */}
                            <motion.div
                                className="card p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h3 className="font-roboto-condensed font-bold mb-4">Major Airlines</h3>
                                <div className="flex flex-wrap gap-2">
                                    {airport.airlines.map(airline => (
                                        <span key={airline} className="px-3 py-1.5 bg-aviation-darker border border-aviation-border rounded-lg text-sm">
                                            {airline}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}

                    {activeTab === 'flights' && (
                        <motion.div
                            className="card overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="p-4 border-b border-aviation-border">
                                <h3 className="font-roboto-condensed font-bold flex items-center gap-2">
                                    <Plane className="w-5 h-5 text-aviation-red" />
                                    Recent Departures
                                </h3>
                            </div>
                            <div className="divide-y divide-aviation-border">
                                {airport.recentFlights.map((flight, i) => (
                                    <Link
                                        key={i}
                                        to={`/flight/${flight.callsign}`}
                                        className="p-4 flex items-center gap-4 hover:bg-aviation-dark/50 transition-colors"
                                    >
                                        <div className="p-2 bg-aviation-dark rounded-lg">
                                            <Plane className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-jetbrains font-bold text-aviation-red">{flight.callsign}</p>
                                            <p className="text-aviation-muted text-sm">To {flight.destination}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-jetbrains text-white">{flight.time}</p>
                                            <p className={`text-xs ${getStatusColor(flight.status)}`}>
                                                {flight.status.toUpperCase()}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'map' && (
                        <motion.div
                            className="card p-0 overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="h-[400px]">
                                <MapContainer
                                    center={[airport.lat, airport.lng]}
                                    zoom={14}
                                    className="h-full w-full"
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                    />
                                    <CircleMarker
                                        center={[airport.lat, airport.lng]}
                                        radius={12}
                                        pathOptions={{
                                            color: '#dc2626',
                                            fillColor: '#dc2626',
                                            fillOpacity: 0.8,
                                            weight: 2
                                        }}
                                    >
                                        <Popup>
                                            <strong>{airport.iata}</strong><br />
                                            {airport.name}
                                        </Popup>
                                    </CircleMarker>
                                </MapContainer>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact */}
                    <motion.div
                        className="card p-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3 className="font-roboto-condensed font-bold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-aviation-red" />
                            Contact
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-aviation-muted text-xs">Phone</p>
                                <p className="text-white font-jetbrains text-sm">{airport.phone}</p>
                            </div>
                            <div>
                                <p className="text-aviation-muted text-xs">Coordinates</p>
                                <p className="text-white font-jetbrains text-sm">
                                    {airport.lat.toFixed(4)}° N, {Math.abs(airport.lng).toFixed(4)}° {airport.lng < 0 ? 'W' : 'E'}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Annual Stats */}
                    <motion.div
                        className="card p-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="font-roboto-condensed font-bold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-aviation-red" />
                            Annual Traffic
                        </h3>
                        <p className="text-3xl font-bold font-roboto-condensed text-white">
                            {(airport.stats.annualPassengers / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-aviation-muted text-sm">Passengers per year</p>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
