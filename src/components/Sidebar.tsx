import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    MapPin,
    Route,
    BarChart3,
    Settings,
    Plane,
    ChevronLeft,
    ChevronRight,
    Activity,
    Globe,
    Camera,
    AlertTriangle
} from 'lucide-react'

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/airports', icon: MapPin, label: 'Airports' },
    { path: '/routes', icon: Route, label: 'Routes' },
    { path: '/congestion', icon: AlertTriangle, label: 'Congestion' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/miles', icon: Globe, label: 'Miles Tracker' },
    { path: '/spotting', icon: Camera, label: 'Spotting' },
    { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [activeFlights, setActiveFlights] = useState(142)

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFlights(prev => Math.max(100, prev + Math.floor(Math.random() * 5) - 2))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <motion.aside
            className="bg-aviation-dark border-r border-aviation-border flex flex-col h-screen w-64 lg:w-auto"
            animate={{ width: isCollapsed ? 72 : 240 }}
            transition={{ duration: 0.2 }}
        >
            {/* Logo */}
            <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 border-b border-aviation-border">
                <Link to="/" className="flex items-center gap-2 md:gap-3">
                    <motion.div
                        className="w-8 h-8 md:w-10 md:h-10 bg-aviation-red rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                        <Plane className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </motion.div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <h1 className="font-roboto-condensed font-bold text-white text-base md:text-lg leading-tight">
                                    AVIATION
                                </h1>
                                <p className="text-[9px] md:text-[10px] text-aviation-red tracking-wider">RELIABILITY TRACKER</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Live Stats */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        className="mx-3 md:mx-4 my-3 md:my-4 p-2 md:p-3 bg-aviation-darker rounded-xl border border-aviation-border"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <Activity className="w-3 h-3 md:w-4 md:h-4 text-green-400 animate-pulse" />
                                <span className="text-[10px] md:text-xs text-aviation-muted">Live Flights</span>
                            </div>
                            <motion.span
                                className="font-jetbrains text-base md:text-lg font-bold text-green-400"
                                key={activeFlights}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                            >
                                {activeFlights}
                            </motion.span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <nav className="flex-1 px-2 md:px-3 py-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <Link key={item.path} to={item.path} className="block">
                            <motion.div
                                className={`
                  relative flex items-center gap-2 md:gap-3 px-2.5 md:px-3 py-2 md:py-2.5 rounded-xl transition-colors
                  ${isActive
                                        ? 'bg-aviation-red text-white'
                                        : 'text-aviation-muted hover:bg-aviation-darker hover:text-white'
                                    }
                `}
                                whileHover={{ x: isCollapsed ? 0 : 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            className="font-medium text-sm whitespace-nowrap"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Collapse Toggle - Hidden on mobile */}
            <div className="hidden lg:block p-3 border-t border-aviation-border">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-aviation-darker border border-aviation-border hover:border-aviation-red transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-aviation-muted" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4 text-aviation-muted" />
                            <span className="text-xs text-aviation-muted">Collapse</span>
                        </>
                    )}
                </button>
            </div>

            {/* Footer */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        className="px-3 md:px-4 py-2 md:py-3 border-t border-aviation-border"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <p className="text-[9px] md:text-[10px] text-aviation-muted text-center">
                            © 2026 Aviation Tracker
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.aside>
    )
}
