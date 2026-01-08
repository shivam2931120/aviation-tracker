import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Route,
    Filter,
    ArrowUpDown,
    TrendingUp,
    TrendingDown,
    Cloud,
    Clock
} from 'lucide-react'

// Mock routes data
const mockRoutes = [
    { id: 1, originIata: 'JFK', originCity: 'New York', destIata: 'LAX', destCity: 'Los Angeles', airlineIata: 'AA', airlineName: 'American Airlines', otpPercent: 75.5, avgDelay: 16.2, weatherRisk: 0.25, peakHourFactor: 1.3, reliabilityIndex: 72.8 },
    { id: 2, originIata: 'JFK', originCity: 'New York', destIata: 'LHR', destCity: 'London', airlineIata: 'BA', airlineName: 'British Airways', otpPercent: 78.2, avgDelay: 14.5, weatherRisk: 0.35, peakHourFactor: 1.1, reliabilityIndex: 74.5 },
    { id: 3, originIata: 'LAX', originCity: 'Los Angeles', destIata: 'ORD', destCity: 'Chicago', airlineIata: 'UA', airlineName: 'United Airlines', otpPercent: 72.8, avgDelay: 18.5, weatherRisk: 0.30, peakHourFactor: 1.4, reliabilityIndex: 68.2 },
    { id: 4, originIata: 'ATL', originCity: 'Atlanta', destIata: 'JFK', destCity: 'New York', airlineIata: 'DL', airlineName: 'Delta Air Lines', otpPercent: 81.5, avgDelay: 10.8, weatherRisk: 0.22, peakHourFactor: 1.1, reliabilityIndex: 79.2 },
    { id: 5, originIata: 'FRA', originCity: 'Frankfurt', destIata: 'JFK', destCity: 'New York', airlineIata: 'LH', airlineName: 'Lufthansa', otpPercent: 80.2, avgDelay: 12.1, weatherRisk: 0.32, peakHourFactor: 1.0, reliabilityIndex: 77.8 },
    { id: 6, originIata: 'LHR', originCity: 'London', destIata: 'FRA', destCity: 'Frankfurt', airlineIata: 'BA', airlineName: 'British Airways', otpPercent: 82.5, avgDelay: 9.5, weatherRisk: 0.20, peakHourFactor: 0.9, reliabilityIndex: 81.2 },
    { id: 7, originIata: 'CDG', originCity: 'Paris', destIata: 'LHR', destCity: 'London', airlineIata: 'BA', airlineName: 'British Airways', otpPercent: 84.1, avgDelay: 8.2, weatherRisk: 0.18, peakHourFactor: 0.8, reliabilityIndex: 83.5 },
    { id: 8, originIata: 'FRA', originCity: 'Frankfurt', destIata: 'CDG', destCity: 'Paris', airlineIata: 'LH', airlineName: 'Lufthansa', otpPercent: 85.2, avgDelay: 7.5, weatherRisk: 0.15, peakHourFactor: 0.8, reliabilityIndex: 84.8 },
]

const airlines = ['All', 'AA', 'BA', 'UA', 'DL', 'LH']

export default function Routes() {
    const [selectedAirline, setSelectedAirline] = useState('All')
    const [sortBy, setSortBy] = useState<'reliabilityIndex' | 'avgDelay' | 'otpPercent'>('reliabilityIndex')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const filteredRoutes = mockRoutes
        .filter(route => selectedAirline === 'All' || route.airlineIata === selectedAirline)
        .sort((a, b) => {
            const aVal = a[sortBy]
            const bVal = b[sortBy]
            return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
        })

    const handleSort = (field: typeof sortBy) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    const getReliabilityColor = (score: number) => {
        if (score >= 80) return 'text-green-400'
        if (score >= 70) return 'text-yellow-400'
        return 'text-red-400'
    }

    const getReliabilityBg = (score: number) => {
        if (score >= 80) return 'bg-green-500/10 border-green-500/20'
        if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/20'
        return 'bg-red-500/10 border-red-500/20'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-roboto-condensed text-2xl font-bold">Routes</h1>
                    <p className="text-aviation-muted text-sm mt-1">
                        Route reliability rankings and performance metrics
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-aviation-muted" />
                        <select
                            value={selectedAirline}
                            onChange={(e) => setSelectedAirline(e.target.value)}
                            className="input-field py-2 pr-8"
                        >
                            {airlines.map(airline => (
                                <option key={airline} value={airline}>
                                    {airline === 'All' ? 'All Airlines' : airline}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Reliability Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoutes.slice(0, 6).map((route, index) => (
                    <motion.div
                        key={route.id}
                        className={`card card-hover p-4 border ${getReliabilityBg(route.reliabilityIndex)}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {/* Route Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-aviation-darker rounded-lg flex items-center justify-center border border-aviation-border">
                                    <Route className="w-5 h-5 text-aviation-red" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-jetbrains font-bold text-white">{route.originIata}</span>
                                        <span className="text-aviation-muted">→</span>
                                        <span className="font-jetbrains font-bold text-white">{route.destIata}</span>
                                    </div>
                                    <p className="text-xs text-aviation-muted">{route.airlineName}</p>
                                </div>
                            </div>
                            <div className={`text-2xl font-roboto-condensed font-bold ${getReliabilityColor(route.reliabilityIndex)}`}>
                                {route.reliabilityIndex.toFixed(1)}
                            </div>
                        </div>

                        {/* Route Cities */}
                        <div className="flex items-center justify-between text-sm text-aviation-muted mb-4">
                            <span>{route.originCity}</span>
                            <span>{route.destCity}</span>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-aviation-darker rounded-lg p-3 border border-aviation-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-3 h-3 text-aviation-muted" />
                                    <span className="text-xs text-aviation-muted">OTP</span>
                                </div>
                                <p className={`font-jetbrains font-medium ${route.otpPercent >= 80 ? 'text-green-400' :
                                        route.otpPercent >= 75 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {route.otpPercent.toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-aviation-darker rounded-lg p-3 border border-aviation-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-3 h-3 text-aviation-muted" />
                                    <span className="text-xs text-aviation-muted">Avg Delay</span>
                                </div>
                                <p className={`font-jetbrains font-medium ${route.avgDelay <= 10 ? 'text-green-400' :
                                        route.avgDelay <= 15 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {route.avgDelay.toFixed(0)} min
                                </p>
                            </div>
                            <div className="bg-aviation-darker rounded-lg p-3 border border-aviation-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <Cloud className="w-3 h-3 text-aviation-muted" />
                                    <span className="text-xs text-aviation-muted">Weather Risk</span>
                                </div>
                                <p className={`font-jetbrains font-medium ${route.weatherRisk <= 0.2 ? 'text-green-400' :
                                        route.weatherRisk <= 0.35 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {(route.weatherRisk * 100).toFixed(0)}%
                                </p>
                            </div>
                            <div className="bg-aviation-darker rounded-lg p-3 border border-aviation-border">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown className="w-3 h-3 text-aviation-muted" />
                                    <span className="text-xs text-aviation-muted">Peak Factor</span>
                                </div>
                                <p className={`font-jetbrains font-medium ${route.peakHourFactor <= 1.0 ? 'text-green-400' :
                                        route.peakHourFactor <= 1.2 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {route.peakHourFactor.toFixed(1)}x
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Routes Table */}
            <motion.div
                className="card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="p-4 border-b border-aviation-border">
                    <h2 className="font-roboto-condensed text-lg font-bold">All Routes</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-aviation-border">
                                <th className="table-header text-left p-4">Route</th>
                                <th className="table-header text-left p-4">Airline</th>
                                <th
                                    className="table-header text-right p-4 cursor-pointer hover:text-white transition-colors"
                                    onClick={() => handleSort('otpPercent')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        OTP %
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th
                                    className="table-header text-right p-4 cursor-pointer hover:text-white transition-colors"
                                    onClick={() => handleSort('avgDelay')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Avg Delay
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="table-header text-right p-4">Weather Risk</th>
                                <th
                                    className="table-header text-right p-4 cursor-pointer hover:text-white transition-colors"
                                    onClick={() => handleSort('reliabilityIndex')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Reliability
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoutes.map((route, index) => (
                                <motion.tr
                                    key={route.id}
                                    className="border-b border-aviation-border/50 hover:bg-aviation-darker transition-colors"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.03 }}
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-jetbrains font-bold text-aviation-red">{route.originIata}</span>
                                            <span className="text-aviation-muted">→</span>
                                            <span className="font-jetbrains font-bold text-aviation-red">{route.destIata}</span>
                                        </div>
                                        <p className="text-xs text-aviation-muted mt-1">
                                            {route.originCity} to {route.destCity}
                                        </p>
                                    </td>
                                    <td className="p-4 text-white">{route.airlineName}</td>
                                    <td className="p-4 text-right">
                                        <span className={`font-jetbrains ${route.otpPercent >= 80 ? 'text-green-400' :
                                                route.otpPercent >= 75 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {route.otpPercent.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`font-jetbrains ${route.avgDelay <= 10 ? 'text-green-400' :
                                                route.avgDelay <= 15 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {route.avgDelay.toFixed(0)} min
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`font-jetbrains ${route.weatherRisk <= 0.2 ? 'text-green-400' :
                                                route.weatherRisk <= 0.35 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {(route.weatherRisk * 100).toFixed(0)}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`font-jetbrains font-bold text-lg ${getReliabilityColor(route.reliabilityIndex)}`}>
                                            {route.reliabilityIndex.toFixed(1)}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
