import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plane,
    MapPin,
    Clock,
    ArrowRight,
    X,
    TrendingUp,
    Filter
} from 'lucide-react'
import { fetchLiveFlights, Flight } from '../lib/aviationApi'

interface FlightSearchProps {
    isOpen: boolean
    onClose: () => void
    flights: Flight[]
}

export default function FlightSearch({ isOpen, onClose, flights }: FlightSearchProps) {
    const [query, setQuery] = useState('')
    const [searchType, setSearchType] = useState<'callsign' | 'route' | 'airline'>('callsign')
    const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])
    const [recentSearches, setRecentSearches] = useState<string[]>([])

    useEffect(() => {
        // Load recent searches from localStorage
        const saved = localStorage.getItem('recentFlightSearches')
        if (saved) {
            setRecentSearches(JSON.parse(saved))
        }
    }, [])

    useEffect(() => {
        if (!query.trim()) {
            setFilteredFlights([])
            return
        }

        const q = query.toLowerCase()
        const results = flights.filter(f => {
            if (searchType === 'callsign') {
                return f.callsign?.toLowerCase().includes(q) || f.icao24?.toLowerCase().includes(q)
            } else if (searchType === 'airline') {
                return f.originCountry?.toLowerCase().includes(q)
            }
            return f.callsign?.toLowerCase().includes(q)
        }).slice(0, 10)

        setFilteredFlights(results)
    }, [query, searchType, flights])

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery)
        // Save to recent searches
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
        setRecentSearches(updated)
        localStorage.setItem('recentFlightSearches', JSON.stringify(updated))
    }

    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem('recentFlightSearches')
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="w-full max-w-2xl bg-aviation-darker border border-aviation-border rounded-2xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: -50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.95 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search Header */}
                    <div className="p-4 border-b border-aviation-border">
                        <div className="flex items-center gap-3">
                            <Search className="w-5 h-5 text-aviation-muted" />
                            <input
                                type="text"
                                placeholder="Search flights by callsign, route, or airline..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="flex-1 bg-transparent text-lg text-white placeholder-aviation-muted focus:outline-none"
                                autoFocus
                            />
                            <button onClick={onClose} className="p-2 hover:bg-aviation-border rounded-lg transition-colors">
                                <X className="w-5 h-5 text-aviation-muted" />
                            </button>
                        </div>

                        {/* Search Type Tabs */}
                        <div className="flex gap-2 mt-3">
                            {[
                                { type: 'callsign', label: 'Callsign' },
                                { type: 'route', label: 'Route' },
                                { type: 'airline', label: 'Country/Airline' }
                            ].map(({ type, label }) => (
                                <button
                                    key={type}
                                    onClick={() => setSearchType(type as any)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${searchType === type
                                            ? 'bg-aviation-red text-white'
                                            : 'bg-aviation-dark text-aviation-muted hover:text-white'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {query.trim() === '' ? (
                            // Show recent searches
                            <div className="p-4">
                                {recentSearches.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-aviation-muted text-sm">Recent Searches</p>
                                            <button
                                                onClick={clearRecentSearches}
                                                className="text-xs text-aviation-red hover:underline"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            {recentSearches.map((search, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSearch(search)}
                                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-aviation-dark transition-colors text-left"
                                                >
                                                    <Clock className="w-4 h-4 text-aviation-muted" />
                                                    <span className="text-white">{search}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Quick Stats */}
                                <div className="mt-4 pt-4 border-t border-aviation-border">
                                    <p className="text-aviation-muted text-sm mb-3">Quick Stats</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-3 bg-aviation-dark rounded-lg text-center">
                                            <p className="text-xl font-bold text-green-400">{flights.filter(f => !f.onGround).length}</p>
                                            <p className="text-xs text-aviation-muted">In Air</p>
                                        </div>
                                        <div className="p-3 bg-aviation-dark rounded-lg text-center">
                                            <p className="text-xl font-bold text-yellow-400">{flights.filter(f => f.onGround).length}</p>
                                            <p className="text-xs text-aviation-muted">On Ground</p>
                                        </div>
                                        <div className="p-3 bg-aviation-dark rounded-lg text-center">
                                            <p className="text-xl font-bold text-aviation-red">{flights.length}</p>
                                            <p className="text-xs text-aviation-muted">Total</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : filteredFlights.length > 0 ? (
                            <div className="p-2">
                                {filteredFlights.map((flight, i) => (
                                    <motion.div
                                        key={flight.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            to={`/flight/${flight.callsign || flight.icao24}`}
                                            onClick={onClose}
                                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-aviation-dark transition-colors"
                                        >
                                            <div className="p-2 bg-aviation-dark rounded-lg">
                                                <Plane className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-jetbrains font-bold text-aviation-red">
                                                        {flight.callsign || flight.icao24}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${flight.onGround
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-green-500/20 text-green-400'
                                                        }`}>
                                                        {flight.onGround ? 'GROUND' : 'IN FLIGHT'}
                                                    </span>
                                                </div>
                                                <p className="text-aviation-muted text-sm">{flight.originCountry}</p>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p className="text-white font-jetbrains">
                                                    {flight.altitude ? `${(flight.altitude / 1000).toFixed(1)}k ft` : '--'}
                                                </p>
                                                <p className="text-aviation-muted">
                                                    {flight.velocity ? `${Math.round(flight.velocity)} kts` : '--'}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-aviation-muted" />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <Search className="w-12 h-12 text-aviation-muted mx-auto mb-3" />
                                <p className="text-aviation-muted">No flights found for "{query}"</p>
                                <p className="text-aviation-muted text-sm mt-1">Try a different search term</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-aviation-border bg-aviation-dark/50">
                        <div className="flex items-center justify-between text-xs text-aviation-muted">
                            <span>Press <kbd className="px-1.5 py-0.5 bg-aviation-border rounded">ESC</kbd> to close</span>
                            <span>{flights.length} flights available</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
