import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ComposedChart,
    Line,
    ScatterChart,
    Scatter,
    ZAxis
} from 'recharts'
import {
    TrendingUp,
    TrendingDown,
    Clock,
    Plane,
    AlertTriangle,
    Globe,
    Activity,
    BarChart3,
    RefreshCw
} from 'lucide-react'
import { fetchLiveFlights, calculateFlightStats, Flight } from '../lib/aviationApi'

// Live data hook
function useLiveFlightData() {
    const [flights, setFlights] = useState<Flight[]>([])
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                const data = await fetchLiveFlights()
                if (data.length > 0) {
                    setFlights(data)
                    setStats(calculateFlightStats(data))
                }
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
        const interval = setInterval(loadData, 60000)
        return () => clearInterval(interval)
    }, [])

    return { flights, stats, isLoading }
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-aviation-dark border border-aviation-border rounded-lg p-3 shadow-xl">
                <p className="text-aviation-red font-jetbrains font-bold text-sm">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-white text-sm">
                        {p.name}: <span className="font-jetbrains">{p.value.toLocaleString()}</span>
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function Analytics() {
    const { flights, stats, isLoading } = useLiveFlightData()

    // Generate analytics data from live flights
    const countryData = stats?.topCountries?.slice(0, 8).map((c: [string, number]) => ({
        name: c[0].slice(0, 12),
        flights: c[1]
    })) || []

    // Altitude distribution
    const altitudeDistribution = [
        { range: '0-10k', count: flights.filter(f => (f.altitude || 0) < 10000).length },
        { range: '10k-20k', count: flights.filter(f => (f.altitude || 0) >= 10000 && (f.altitude || 0) < 20000).length },
        { range: '20k-30k', count: flights.filter(f => (f.altitude || 0) >= 20000 && (f.altitude || 0) < 30000).length },
        { range: '30k-40k', count: flights.filter(f => (f.altitude || 0) >= 30000 && (f.altitude || 0) < 40000).length },
        { range: '40k+', count: flights.filter(f => (f.altitude || 0) >= 40000).length },
    ]

    // Speed distribution
    const speedDistribution = [
        { range: '0-200', count: flights.filter(f => (f.velocity || 0) < 200).length },
        { range: '200-400', count: flights.filter(f => (f.velocity || 0) >= 200 && (f.velocity || 0) < 400).length },
        { range: '400-500', count: flights.filter(f => (f.velocity || 0) >= 400 && (f.velocity || 0) < 500).length },
        { range: '500-600', count: flights.filter(f => (f.velocity || 0) >= 500 && (f.velocity || 0) < 600).length },
        { range: '600+', count: flights.filter(f => (f.velocity || 0) >= 600).length },
    ]

    // Flight status pie
    const statusData = [
        { name: 'In Flight', value: stats?.active || 0, color: '#22c55e' },
        { name: 'On Ground', value: stats?.grounded || 0, color: '#eab308' },
    ]

    // Radar chart data for performance metrics
    const performanceData = [
        { metric: 'Speed', value: Math.min(100, ((stats?.avgSpeed || 0) / 6)), fullMark: 100 },
        { metric: 'Altitude', value: Math.min(100, ((stats?.avgAltitude || 0) / 450)), fullMark: 100 },
        { metric: 'Active', value: Math.min(100, ((stats?.active || 0) / 5)), fullMark: 100 },
        { metric: 'Coverage', value: (stats?.topCountries?.length || 0) * 10, fullMark: 100 },
        { metric: 'Density', value: Math.min(100, flights.length / 5), fullMark: 100 },
    ]

    // Scatter plot data (speed vs altitude)
    const scatterData = flights.slice(0, 100).map(f => ({
        altitude: f.altitude || 0,
        speed: f.velocity || 0,
        country: f.originCountry
    }))

    // Time-based mock data for trend
    const hourlyTrend = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        flights: Math.floor(80 + Math.random() * 40 + (i >= 6 && i <= 20 ? 30 : 0)),
        avgSpeed: Math.floor(420 + Math.random() * 60)
    }))

    const overviewStats = [
        { label: 'Total Flights', value: stats?.total?.toLocaleString() || '--', change: '+12%', trend: 'up', icon: Plane },
        { label: 'Avg Speed', value: stats?.avgSpeed ? `${stats.avgSpeed} kts` : '--', change: '+5%', trend: 'up', icon: Activity },
        { label: 'Avg Altitude', value: stats?.avgAltitude ? `${(stats.avgAltitude / 1000).toFixed(1)}k ft` : '--', change: '+2%', trend: 'up', icon: TrendingUp },
        { label: 'Countries', value: stats?.topCountries?.length?.toString() || '--', change: '+3', trend: 'up', icon: Globe },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-roboto-condensed text-2xl font-bold flex items-center gap-3">
                        Analytics
                        {isLoading && <RefreshCw className="w-5 h-5 animate-spin text-aviation-muted" />}
                    </h1>
                    <p className="text-aviation-muted text-sm mt-1">
                        Real-time flight data analysis • {flights.length.toLocaleString()} flights tracked
                    </p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            className="card p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-aviation-muted">{stat.label}</p>
                                    <p className="text-2xl font-roboto-condensed font-bold text-white mt-1">{stat.value}</p>
                                    <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                        {stat.change}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-aviation-darker border border-aviation-border">
                                    <Icon className="w-5 h-5 text-aviation-red" />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Country Distribution - 3D-style gradient bars */}
                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="font-roboto-condensed text-lg font-bold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-aviation-red" />
                        Flights by Country
                    </h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={countryData} layout="vertical">
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#dc2626" />
                                        <stop offset="100%" stopColor="#ef4444" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                                <XAxis type="number" stroke="#a3a3a3" fontSize={11} />
                                <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={10} width={80} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="flights" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Flight Status Pie with 3D effect */}
                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="font-roboto-condensed text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        Flight Status Distribution
                    </h2>
                    <div className="h-72 flex items-center">
                        <div className="w-1/2">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <defs>
                                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
                                        </filter>
                                    </defs>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        style={{ filter: 'url(#shadow)' }}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 space-y-4">
                            {statusData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-3 bg-aviation-darker rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                                        <span className="text-sm text-white">{item.name}</span>
                                    </div>
                                    <span className="font-jetbrains text-lg font-bold text-white">{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Altitude Distribution - Gradient area */}
                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="font-roboto-condensed text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Altitude Distribution
                    </h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={altitudeDistribution}>
                                <defs>
                                    <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                                <XAxis dataKey="range" stroke="#a3a3a3" fontSize={11} />
                                <YAxis stroke="#a3a3a3" fontSize={11} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    fill="url(#altitudeGradient)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Performance Radar */}
                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="font-roboto-condensed text-lg font-bold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        Performance Radar
                    </h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={performanceData}>
                                <PolarGrid stroke="#262626" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#a3a3a3', fontSize: 11 }} />
                                <PolarRadiusAxis tick={{ fill: '#a3a3a3', fontSize: 10 }} domain={[0, 100]} />
                                <Radar
                                    name="Performance"
                                    dataKey="value"
                                    stroke="#dc2626"
                                    fill="#dc2626"
                                    fillOpacity={0.4}
                                    strokeWidth={2}
                                />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Full-width charts */}
            <div className="grid grid-cols-1 gap-6">
                {/* Hourly Trend - Combined Line + Area */}
                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h2 className="font-roboto-condensed text-lg font-bold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-aviation-red" />
                        24-Hour Flight Activity Trend
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={hourlyTrend}>
                                <defs>
                                    <linearGradient id="flightGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                                <XAxis dataKey="hour" stroke="#a3a3a3" fontSize={10} />
                                <YAxis yAxisId="left" stroke="#a3a3a3" fontSize={11} />
                                <YAxis yAxisId="right" orientation="right" stroke="#a3a3a3" fontSize={11} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="flights"
                                    fill="url(#flightGradient)"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="avgSpeed"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-8 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-aviation-red" />
                            <span className="text-xs text-aviation-muted">Flights</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-green-400" />
                            <span className="text-xs text-aviation-muted">Avg Speed (kts)</span>
                        </div>
                    </div>
                </motion.div>

                {/* Speed Distribution */}
                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <h2 className="font-roboto-condensed text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-yellow-400" />
                        Speed Distribution (knots)
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={speedDistribution}>
                                <defs>
                                    <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#eab308" />
                                        <stop offset="100%" stopColor="#ca8a04" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                                <XAxis dataKey="range" stroke="#a3a3a3" fontSize={11} />
                                <YAxis stroke="#a3a3a3" fontSize={11} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="url(#speedGradient)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
