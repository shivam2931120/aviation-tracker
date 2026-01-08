import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Database,
    Type,
    Monitor,
    Globe,
    Shield,
    Server,
    Activity,
    CheckCircle,
    Clock,
    Settings as SettingsIcon,
    Bell,
    Moon,
    Zap
} from 'lucide-react'

export default function Settings() {
    const [notifications, setNotifications] = useState({
        flightAlerts: true,
        delayNotifications: true,
        incidentAlerts: true,
        weeklyReports: false
    })

    const [preferences, setPreferences] = useState({
        darkMode: true,
        autoRefresh: true,
        refreshInterval: '30',
        mapStyle: 'dark',
        temperatureUnit: 'celsius',
        distanceUnit: 'km'
    })

    const fonts = [
        { name: 'Roboto Condensed', class: 'font-roboto-condensed', usage: 'Aviation headings' },
        { name: 'Inter', class: 'font-inter', usage: 'Body text' },
        { name: 'Source Sans 3', class: 'font-source-sans', usage: 'Tables' },
        { name: 'JetBrains Mono', class: 'font-jetbrains', usage: 'ICAO codes, callsigns' },
    ]

    const systemStatus = [
        { name: 'Flight Data Service', status: 'operational', latency: '45ms' },
        { name: 'Airport Database', status: 'operational', latency: '12ms' },
        { name: 'Delay Prediction Engine', status: 'operational', latency: '89ms' },
        { name: 'Real-time Updates', status: 'operational', latency: '23ms' },
    ]

    const dbStats = {
        flights: 2847,
        airports: 50,
        routes: 120,
        airlines: 12,
        incidents: 8,
        lastSync: new Date().toISOString(),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-roboto-condensed text-2xl font-bold">Settings</h1>
                <p className="text-aviation-muted text-sm mt-1">
                    Configure application preferences and view system status
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Status */}
                <motion.div
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                            <Activity className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h2 className="font-roboto-condensed text-lg font-bold">System Status</h2>
                            <p className="text-sm text-aviation-muted">All systems operational</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {systemStatus.map((service, i) => (
                            <motion.div
                                key={service.name}
                                className="flex items-center justify-between p-3 bg-aviation-darker rounded-xl border border-aviation-border"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-white text-sm">{service.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-aviation-muted font-jetbrains">{service.latency}</span>
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">
                                        Online
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Database Status */}
                <motion.div
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-aviation-red/10 rounded-xl flex items-center justify-center border border-aviation-red/20">
                            <Database className="w-5 h-5 text-aviation-red" />
                        </div>
                        <div>
                            <h2 className="font-roboto-condensed text-lg font-bold">Database Overview</h2>
                            <p className="text-sm text-aviation-muted">PostgreSQL via Prisma ORM</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {Object.entries(dbStats).slice(0, -1).map(([key, value]) => (
                            <div key={key} className="bg-aviation-darker rounded-xl p-3 border border-aviation-border">
                                <p className="text-xs text-aviation-muted capitalize">{key}</p>
                                <p className="text-xl font-roboto-condensed font-bold text-white mt-1">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-aviation-darker rounded-xl p-3 border border-aviation-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-aviation-muted" />
                                <span className="text-sm text-aviation-muted">Last Sync</span>
                            </div>
                            <span className="font-jetbrains text-white text-sm">
                                {new Date(dbStats.lastSync).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Notification Preferences */}
                <motion.div
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-aviation-red/10 rounded-xl flex items-center justify-center border border-aviation-red/20">
                            <Bell className="w-5 h-5 text-aviation-red" />
                        </div>
                        <div>
                            <h2 className="font-roboto-condensed text-lg font-bold">Notifications</h2>
                            <p className="text-sm text-aviation-muted">Configure alert preferences</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { key: 'flightAlerts', label: 'Flight Status Alerts', desc: 'Get notified about flight changes' },
                            { key: 'delayNotifications', label: 'Delay Notifications', desc: 'Alerts for significant delays' },
                            { key: 'incidentAlerts', label: 'Incident Alerts', desc: 'Critical incident notifications' },
                            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly analytics summary' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-aviation-darker rounded-xl border border-aviation-border">
                                <div>
                                    <p className="text-white text-sm font-medium">{item.label}</p>
                                    <p className="text-xs text-aviation-muted">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({
                                        ...prev,
                                        [item.key]: !prev[item.key as keyof typeof notifications]
                                    }))}
                                    className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.key as keyof typeof notifications]
                                            ? 'bg-aviation-red'
                                            : 'bg-aviation-border'
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${notifications[item.key as keyof typeof notifications]
                                            ? 'right-0.5'
                                            : 'left-0.5'
                                        }`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Display Preferences */}
                <motion.div
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-aviation-red/10 rounded-xl flex items-center justify-center border border-aviation-red/20">
                            <Monitor className="w-5 h-5 text-aviation-red" />
                        </div>
                        <div>
                            <h2 className="font-roboto-condensed text-lg font-bold">Display Preferences</h2>
                            <p className="text-sm text-aviation-muted">Customize your experience</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Dark Mode */}
                        <div className="flex items-center justify-between p-3 bg-aviation-darker rounded-xl border border-aviation-border">
                            <div className="flex items-center gap-3">
                                <Moon className="w-4 h-4 text-aviation-muted" />
                                <div>
                                    <p className="text-white text-sm font-medium">Dark Mode</p>
                                    <p className="text-xs text-aviation-muted">Aviation-optimized dark theme</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">
                                Always On
                            </span>
                        </div>

                        {/* Auto Refresh */}
                        <div className="flex items-center justify-between p-3 bg-aviation-darker rounded-xl border border-aviation-border">
                            <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-aviation-muted" />
                                <div>
                                    <p className="text-white text-sm font-medium">Auto Refresh</p>
                                    <p className="text-xs text-aviation-muted">Automatically update flight data</p>
                                </div>
                            </div>
                            <select
                                value={preferences.refreshInterval}
                                onChange={(e) => setPreferences(prev => ({ ...prev, refreshInterval: e.target.value }))}
                                className="bg-aviation-black border border-aviation-border rounded-lg px-3 py-1.5 text-sm text-white"
                            >
                                <option value="15">15 seconds</option>
                                <option value="30">30 seconds</option>
                                <option value="60">1 minute</option>
                                <option value="300">5 minutes</option>
                            </select>
                        </div>

                        {/* Units */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-aviation-darker rounded-xl border border-aviation-border">
                                <p className="text-xs text-aviation-muted mb-2">Temperature</p>
                                <div className="flex gap-2">
                                    {['celsius', 'fahrenheit'].map(unit => (
                                        <button
                                            key={unit}
                                            onClick={() => setPreferences(prev => ({ ...prev, temperatureUnit: unit }))}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${preferences.temperatureUnit === unit
                                                    ? 'bg-aviation-red text-white'
                                                    : 'bg-aviation-black border border-aviation-border text-aviation-muted'
                                                }`}
                                        >
                                            {unit === 'celsius' ? '°C' : '°F'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 bg-aviation-darker rounded-xl border border-aviation-border">
                                <p className="text-xs text-aviation-muted mb-2">Distance</p>
                                <div className="flex gap-2">
                                    {['km', 'mi'].map(unit => (
                                        <button
                                            key={unit}
                                            onClick={() => setPreferences(prev => ({ ...prev, distanceUnit: unit }))}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${preferences.distanceUnit === unit
                                                    ? 'bg-aviation-red text-white'
                                                    : 'bg-aviation-black border border-aviation-border text-aviation-muted'
                                                }`}
                                        >
                                            {unit.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Typography Preview */}
            <motion.div
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-aviation-red/10 rounded-xl flex items-center justify-center border border-aviation-red/20">
                        <Type className="w-5 h-5 text-aviation-red" />
                    </div>
                    <div>
                        <h2 className="font-roboto-condensed text-lg font-bold">Typography System</h2>
                        <p className="text-sm text-aviation-muted">Aviation-themed font stack</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {fonts.map((font, i) => (
                        <motion.div
                            key={font.name}
                            className="bg-aviation-darker rounded-xl p-4 border border-aviation-border"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                        >
                            <p className="text-xs text-aviation-muted mb-2">{font.usage}</p>
                            <p className={`text-xl text-white ${font.class}`}>{font.name}</p>
                            <p className={`text-sm text-aviation-muted mt-2 ${font.class}`}>
                                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                            </p>
                            <p className={`text-sm text-aviation-red mt-1 ${font.class}`}>
                                0123456789
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Sample Usage */}
                <div className="mt-6 bg-aviation-darker rounded-xl p-6 border border-aviation-border">
                    <h3 className="font-roboto-condensed text-lg font-bold mb-4">Sample Display</h3>
                    <div className="space-y-4">
                        <p className="font-roboto-condensed text-2xl text-white">AVIATION RELIABILITY TRACKER</p>
                        <p className="font-inter text-aviation-muted">Real-time flight monitoring and delay prediction platform with global coverage.</p>
                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <span className="font-jetbrains text-aviation-red text-lg">AAL123</span>
                                <span className="text-aviation-muted">•</span>
                                <span className="font-jetbrains text-aviation-muted">KJFK</span>
                                <span className="text-white">→</span>
                                <span className="font-jetbrains text-aviation-muted">KLAX</span>
                            </div>
                            <div className="px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-lg border border-green-500/20 font-medium">
                                On Time
                            </div>
                        </div>
                        <table className="w-full mt-4 max-w-md">
                            <thead>
                                <tr className="border-b border-aviation-border">
                                    <th className="font-source-sans text-aviation-muted text-left uppercase text-xs tracking-wider py-2">Metric</th>
                                    <th className="font-source-sans text-aviation-muted text-right uppercase text-xs tracking-wider py-2">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-source-sans py-2 text-white">On-Time Performance</td>
                                    <td className="font-jetbrains text-green-400 text-right py-2">78.5%</td>
                                </tr>
                                <tr>
                                    <td className="font-source-sans py-2 text-white">Average Delay</td>
                                    <td className="font-jetbrains text-yellow-400 text-right py-2">12.3 min</td>
                                </tr>
                                <tr>
                                    <td className="font-source-sans py-2 text-white">Reliability Score</td>
                                    <td className="font-jetbrains text-aviation-red text-right py-2">85.2</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>

            {/* About Section */}
            <motion.div
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-aviation-red rounded-xl flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-roboto-condensed text-lg font-bold">About</h2>
                        <p className="text-sm text-aviation-muted">Aviation Reliability Tracker v1.0.0</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-4 bg-aviation-darker rounded-xl border border-aviation-border">
                        <p className="text-2xl font-roboto-condensed font-bold text-aviation-red">50+</p>
                        <p className="text-xs text-aviation-muted mt-1">Global Airports</p>
                    </div>
                    <div className="text-center p-4 bg-aviation-darker rounded-xl border border-aviation-border">
                        <p className="text-2xl font-roboto-condensed font-bold text-aviation-red">12</p>
                        <p className="text-xs text-aviation-muted mt-1">Major Airlines</p>
                    </div>
                    <div className="text-center p-4 bg-aviation-darker rounded-xl border border-aviation-border">
                        <p className="text-2xl font-roboto-condensed font-bold text-aviation-red">120+</p>
                        <p className="text-xs text-aviation-muted mt-1">Routes Tracked</p>
                    </div>
                    <div className="text-center p-4 bg-aviation-darker rounded-xl border border-aviation-border">
                        <p className="text-2xl font-roboto-condensed font-bold text-aviation-red">24/7</p>
                        <p className="text-xs text-aviation-muted mt-1">Real-time Updates</p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
