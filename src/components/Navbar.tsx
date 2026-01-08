import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, RefreshCw, Wifi, WifiOff, Plane, MapPin, Route, X, Menu } from 'lucide-react'

const searchData = {
    flights: [
        { id: '1', callsign: 'AAL123', route: 'JFK → LAX', airline: 'American Airlines' },
        { id: '2', callsign: 'UAL456', route: 'LAX → ORD', airline: 'United Airlines' },
        { id: '3', callsign: 'DAL789', route: 'ATL → JFK', airline: 'Delta Air Lines' },
        { id: '4', callsign: 'BAW101', route: 'LHR → JFK', airline: 'British Airways' },
        { id: '5', callsign: 'DLH202', route: 'FRA → JFK', airline: 'Lufthansa' },
    ],
    airports: [
        { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
        { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
        { iata: 'LHR', name: 'Heathrow Airport', city: 'London' },
    ],
}

interface NavbarProps {
    onMenuClick?: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [isOnline, setIsOnline] = useState(true)
    const [lastUpdate, setLastUpdate] = useState(new Date())
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleRefresh = () => {
        setIsRefreshing(true)
        setLastUpdate(new Date())
        setTimeout(() => setIsRefreshing(false), 1000)
    }

    const filteredFlights = searchQuery.length >= 2
        ? searchData.flights.filter(f => f.callsign.toLowerCase().includes(searchQuery.toLowerCase()) || f.route.toLowerCase().includes(searchQuery.toLowerCase()))
        : []

    const filteredAirports = searchQuery.length >= 2
        ? searchData.airports.filter(a => a.iata.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : []

    const hasResults = filteredFlights.length > 0 || filteredAirports.length > 0

    const notifications = [
        { id: 1, message: 'AAL123 delayed by 25 minutes', time: '5m ago' },
        { id: 2, message: 'Weather alert at LAX', time: '12m ago' },
        { id: 3, message: 'SFO fog advisory lifted', time: '45m ago' },
    ]

    return (
        <header className="h-14 md:h-16 bg-aviation-dark border-b border-aviation-border flex items-center justify-between px-3 md:px-6 sticky top-0 z-40">
            {/* Left: Menu + Search */}
            <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-xl" ref={searchRef}>
                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 bg-aviation-darker rounded-lg border border-aviation-border"
                    onClick={onMenuClick}
                >
                    <Menu className="w-5 h-5 text-aviation-muted" />
                </button>

                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aviation-muted" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setShowResults(e.target.value.length >= 2) }}
                        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                        className="w-full bg-aviation-darker border border-aviation-border rounded-lg pl-8 md:pl-10 pr-8 py-1.5 md:py-2 text-sm text-white placeholder-aviation-muted focus:outline-none focus:border-aviation-red transition-colors"
                    />
                    {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setShowResults(false) }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <X className="w-4 h-4 text-aviation-muted hover:text-white" />
                        </button>
                    )}

                    {/* Search Results */}
                    <AnimatePresence>
                        {showResults && hasResults && (
                            <motion.div
                                className="absolute top-full left-0 right-0 mt-2 bg-aviation-dark border border-aviation-border rounded-xl shadow-2xl overflow-hidden z-50"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredFlights.length > 0 && (
                                        <div className="p-2">
                                            <p className="text-[10px] text-aviation-muted px-2 py-1 font-medium">FLIGHTS</p>
                                            {filteredFlights.slice(0, 3).map(flight => (
                                                <button
                                                    key={flight.id}
                                                    onClick={() => { navigate(`/flight/${flight.id}`); setShowResults(false); setSearchQuery('') }}
                                                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-aviation-darker transition-colors"
                                                >
                                                    <Plane className="w-4 h-4 text-aviation-red" />
                                                    <div className="text-left">
                                                        <p className="text-sm text-white font-medium">{flight.callsign}</p>
                                                        <p className="text-[10px] text-aviation-muted">{flight.route}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {filteredAirports.length > 0 && (
                                        <div className="p-2 border-t border-aviation-border">
                                            <p className="text-[10px] text-aviation-muted px-2 py-1 font-medium">AIRPORTS</p>
                                            {filteredAirports.slice(0, 3).map(airport => (
                                                <button
                                                    key={airport.iata}
                                                    onClick={() => { navigate('/airports'); setShowResults(false); setSearchQuery('') }}
                                                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-aviation-darker transition-colors"
                                                >
                                                    <MapPin className="w-4 h-4 text-aviation-red" />
                                                    <div className="text-left">
                                                        <p className="text-sm text-white font-medium">{airport.iata}</p>
                                                        <p className="text-[10px] text-aviation-muted">{airport.name}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right: Status + Actions */}
            <div className="flex items-center gap-1.5 md:gap-3">
                {/* Connection Status */}
                <motion.div
                    className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] md:text-xs font-medium ${isOnline ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    <span className="hidden md:inline">{isOnline ? 'Live' : 'Offline'}</span>
                </motion.div>

                {/* Time */}
                <div className="hidden md:block text-[10px] text-aviation-muted">
                    <span className="text-white font-jetbrains">{lastUpdate.toLocaleTimeString()}</span>
                </div>

                {/* Refresh */}
                <motion.button onClick={handleRefresh} className="p-1.5 md:p-2 rounded-lg bg-aviation-darker border border-aviation-border hover:border-aviation-red transition-colors" whileTap={{ scale: 0.95 }}>
                    <RefreshCw className={`w-4 h-4 text-aviation-muted ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        className="relative p-1.5 md:p-2 rounded-lg bg-aviation-darker border border-aviation-border hover:border-aviation-red transition-colors"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className="w-4 h-4 text-aviation-muted" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-aviation-red rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                            {notifications.length}
                        </span>
                    </motion.button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                className="absolute top-full right-0 mt-2 w-64 md:w-80 bg-aviation-dark border border-aviation-border rounded-xl shadow-2xl overflow-hidden z-50"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="p-2.5 border-b border-aviation-border flex items-center justify-between">
                                    <p className="font-medium text-white text-sm">Notifications</p>
                                    <button className="text-[10px] text-aviation-red hover:underline">Clear</button>
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                    {notifications.map(n => (
                                        <div key={n.id} className="p-2.5 border-b border-aviation-border/50 hover:bg-aviation-darker transition-colors cursor-pointer">
                                            <p className="text-xs text-white">{n.message}</p>
                                            <p className="text-[10px] text-aviation-muted mt-0.5">{n.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}
