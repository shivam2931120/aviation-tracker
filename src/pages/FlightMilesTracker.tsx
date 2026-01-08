import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plane,
    Globe,
    MapPin,
    Calendar,
    TrendingUp,
    Award,
    Clock,
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    X
} from 'lucide-react'

interface TrackedFlight {
    id: string
    date: string
    flightNumber: string
    airline: string
    origin: { iata: string; city: string }
    destination: { iata: string; city: string }
    distance: number
    duration: string
    aircraft: string
    class: 'economy' | 'business' | 'first'
}

// Load from localStorage or use defaults
const getStoredFlights = (): TrackedFlight[] => {
    const stored = localStorage.getItem('trackedFlights')
    if (stored) {
        return JSON.parse(stored)
    }
    return [
        {
            id: '1',
            date: '2024-01-07',
            flightNumber: 'BA178',
            airline: 'British Airways',
            origin: { iata: 'JFK', city: 'New York' },
            destination: { iata: 'LHR', city: 'London' },
            distance: 5541,
            duration: '7h 15m',
            aircraft: 'Boeing 777-300ER',
            class: 'business'
        },
        {
            id: '2',
            date: '2024-01-05',
            flightNumber: 'EK203',
            airline: 'Emirates',
            origin: { iata: 'DXB', city: 'Dubai' },
            destination: { iata: 'JFK', city: 'New York' },
            distance: 11023,
            duration: '14h 30m',
            aircraft: 'Airbus A380-800',
            class: 'first'
        },
        {
            id: '3',
            date: '2024-01-02',
            flightNumber: 'LH400',
            airline: 'Lufthansa',
            origin: { iata: 'FRA', city: 'Frankfurt' },
            destination: { iata: 'JFK', city: 'New York' },
            distance: 6198,
            duration: '8h 45m',
            aircraft: 'Airbus A380-800',
            class: 'economy'
        },
        {
            id: '4',
            date: '2023-12-28',
            flightNumber: 'SQ22',
            airline: 'Singapore Airlines',
            origin: { iata: 'SIN', city: 'Singapore' },
            destination: { iata: 'JFK', city: 'New York' },
            distance: 15343,
            duration: '18h 50m',
            aircraft: 'Airbus A350-900ULR',
            class: 'business'
        }
    ]
}

export default function FlightMilesTracker() {
    const [flights, setFlights] = useState<TrackedFlight[]>(getStoredFlights)
    const [selectedYear, setSelectedYear] = useState<number>(2024)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingFlight, setEditingFlight] = useState<TrackedFlight | null>(null)

    // Form state
    const [formData, setFormData] = useState<{
        date: string
        flightNumber: string
        airline: string
        originIata: string
        originCity: string
        destIata: string
        destCity: string
        distance: string
        duration: string
        aircraft: string
        class: 'economy' | 'business' | 'first'
    }>({
        date: new Date().toISOString().split('T')[0],
        flightNumber: '',
        airline: '',
        originIata: '',
        originCity: '',
        destIata: '',
        destCity: '',
        distance: '',
        duration: '',
        aircraft: '',
        class: 'economy'
    })

    // Save to localStorage whenever flights change
    useEffect(() => {
        localStorage.setItem('trackedFlights', JSON.stringify(flights))
    }, [flights])

    // Calculate stats
    const totalMiles = flights.reduce((sum, f) => sum + f.distance, 0)
    const totalFlights = flights.length
    const uniqueAirports = new Set([
        ...flights.map(f => f.origin.iata),
        ...flights.map(f => f.destination.iata)
    ]).size
    const uniqueAirlines = new Set(flights.map(f => f.airline)).size

    // Calculate totals by class
    const classMiles = {
        economy: flights.filter(f => f.class === 'economy').reduce((sum, f) => sum + f.distance, 0),
        business: flights.filter(f => f.class === 'business').reduce((sum, f) => sum + f.distance, 0),
        first: flights.filter(f => f.class === 'first').reduce((sum, f) => sum + f.distance, 0),
    }

    // Achievements
    const achievements = [
        { name: 'First Flight', icon: '🛫', earned: totalFlights >= 1, requirement: '1 flight' },
        { name: 'Frequent Flyer', icon: '✈️', earned: totalFlights >= 10, requirement: '10 flights' },
        { name: 'Globe Trotter', icon: '🌍', earned: totalMiles >= 50000, requirement: '50K miles' },
        { name: 'Million Miler', icon: '🏆', earned: totalMiles >= 1000000, requirement: '1M miles' },
        { name: 'Airport Collector', icon: '🗺️', earned: uniqueAirports >= 20, requirement: '20 airports' },
        { name: 'First Class', icon: '👑', earned: classMiles.first > 0, requirement: 'Fly first class' },
    ]

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            flightNumber: '',
            airline: '',
            originIata: '',
            originCity: '',
            destIata: '',
            destCity: '',
            distance: '',
            duration: '',
            aircraft: '',
            class: 'economy'
        })
        setEditingFlight(null)
    }

    const openAddModal = () => {
        resetForm()
        setIsAddModalOpen(true)
    }

    const openEditModal = (flight: TrackedFlight) => {
        setEditingFlight(flight)
        setFormData({
            date: flight.date,
            flightNumber: flight.flightNumber,
            airline: flight.airline,
            originIata: flight.origin.iata,
            originCity: flight.origin.city,
            destIata: flight.destination.iata,
            destCity: flight.destination.city,
            distance: flight.distance.toString(),
            duration: flight.duration,
            aircraft: flight.aircraft,
            class: flight.class
        })
        setIsAddModalOpen(true)
    }

    const handleSave = () => {
        if (!formData.flightNumber || !formData.originIata || !formData.destIata) {
            alert('Please fill in required fields')
            return
        }

        const flightData: TrackedFlight = {
            id: editingFlight?.id || Date.now().toString(),
            date: formData.date,
            flightNumber: formData.flightNumber.toUpperCase(),
            airline: formData.airline,
            origin: { iata: formData.originIata.toUpperCase(), city: formData.originCity },
            destination: { iata: formData.destIata.toUpperCase(), city: formData.destCity },
            distance: parseInt(formData.distance) || 0,
            duration: formData.duration,
            aircraft: formData.aircraft,
            class: formData.class
        }

        if (editingFlight) {
            setFlights(prev => prev.map(f => f.id === editingFlight.id ? flightData : f))
        } else {
            setFlights(prev => [flightData, ...prev])
        }

        setIsAddModalOpen(false)
        resetForm()
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this flight?')) {
            setFlights(prev => prev.filter(f => f.id !== id))
        }
    }

    const filteredFlights = flights.filter(f => {
        const year = parseInt(f.date.split('-')[0])
        return year === selectedYear
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="font-roboto-condensed text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-aviation-red" />
                        Flight Miles Tracker
                    </h1>
                    <p className="text-aviation-muted text-sm">Track your journeys around the world</p>
                </div>
                <button onClick={openAddModal} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Add Flight
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    className="card p-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Globe className="w-8 h-8 text-aviation-red mx-auto mb-2" />
                    <p className="text-3xl font-bold font-roboto-condensed text-white">
                        {totalMiles.toLocaleString()}
                    </p>
                    <p className="text-aviation-muted text-sm">Total Miles</p>
                    <p className="text-green-400 text-xs mt-1">
                        {(totalMiles / 40075).toFixed(1)}x around Earth
                    </p>
                </motion.div>

                <motion.div
                    className="card p-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Plane className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold font-roboto-condensed text-white">{totalFlights}</p>
                    <p className="text-aviation-muted text-sm">Total Flights</p>
                </motion.div>

                <motion.div
                    className="card p-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold font-roboto-condensed text-white">{uniqueAirports}</p>
                    <p className="text-aviation-muted text-sm">Airports Visited</p>
                </motion.div>

                <motion.div
                    className="card p-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold font-roboto-condensed text-white">{uniqueAirlines}</p>
                    <p className="text-aviation-muted text-sm">Airlines Flown</p>
                </motion.div>
            </div>

            {/* Miles by Class */}
            <motion.div
                className="card p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="font-roboto-condensed font-bold mb-4">Miles by Class</h3>
                <div className="space-y-3">
                    {[
                        { key: 'economy', label: 'Economy', color: 'bg-gray-500', textColor: 'text-gray-400' },
                        { key: 'business', label: 'Business', color: 'bg-blue-500', textColor: 'text-blue-400' },
                        { key: 'first', label: 'First Class', color: 'bg-yellow-500', textColor: 'text-yellow-400' }
                    ].map(({ key, label, color, textColor }) => (
                        <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className={textColor}>{label}</span>
                                <span className="text-white font-jetbrains">
                                    {classMiles[key as keyof typeof classMiles].toLocaleString()} mi
                                </span>
                            </div>
                            <div className="h-2 bg-aviation-darker rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${color} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: totalMiles > 0 ? `${(classMiles[key as keyof typeof classMiles] / totalMiles) * 100}%` : '0%' }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
                className="card p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="font-roboto-condensed font-bold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Achievements
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {achievements.map((achievement, i) => (
                        <motion.div
                            key={achievement.name}
                            className={`text-center p-3 rounded-lg border ${achievement.earned
                                ? 'bg-aviation-dark border-yellow-500/30'
                                : 'bg-aviation-darker border-aviation-border opacity-50'
                                }`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.05 }}
                        >
                            <span className="text-2xl">{achievement.icon}</span>
                            <p className={`text-xs mt-1 ${achievement.earned ? 'text-white' : 'text-aviation-muted'}`}>
                                {achievement.name}
                            </p>
                            <p className="text-[10px] text-aviation-muted">{achievement.requirement}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Flight History */}
            <motion.div
                className="card overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <div className="p-4 border-b border-aviation-border flex items-center justify-between">
                    <h3 className="font-roboto-condensed font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-aviation-red" />
                        Flight History
                    </h3>
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="bg-aviation-darker border border-aviation-border rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value={2024}>2024</option>
                        <option value={2023}>2023</option>
                        <option value={2022}>2022</option>
                    </select>
                </div>
                <div className="divide-y divide-aviation-border">
                    <AnimatePresence>
                        {filteredFlights.length === 0 ? (
                            <div className="p-8 text-center">
                                <Plane className="w-12 h-12 text-aviation-muted mx-auto mb-3" />
                                <p className="text-aviation-muted">No flights recorded for {selectedYear}</p>
                                <button onClick={openAddModal} className="btn-primary mt-4">
                                    <Plus className="w-4 h-4" />
                                    Add Flight
                                </button>
                            </div>
                        ) : (
                            filteredFlights.map((flight, i) => (
                                <motion.div
                                    key={flight.id}
                                    className="p-4 hover:bg-aviation-dark/50 transition-colors group"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: i * 0.05 }}
                                    layout
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-center min-w-[50px]">
                                            <p className="text-aviation-muted text-xs">{flight.date.split('-')[1]}/{flight.date.split('-')[2]}</p>
                                            <p className="text-aviation-muted text-[10px]">{flight.date.split('-')[0]}</p>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-jetbrains font-bold text-white">{flight.origin.iata}</span>
                                                <div className="flex-1 flex items-center gap-2">
                                                    <div className="h-px flex-1 bg-aviation-border"></div>
                                                    <Plane className="w-4 h-4 text-aviation-muted rotate-90" />
                                                    <div className="h-px flex-1 bg-aviation-border"></div>
                                                </div>
                                                <span className="font-jetbrains font-bold text-white">{flight.destination.iata}</span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-xs text-aviation-muted">
                                                <span>{flight.airline}</span>
                                                <span className="font-jetbrains">{flight.flightNumber}</span>
                                                <span>{flight.aircraft}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-jetbrains text-aviation-red font-bold">{flight.distance.toLocaleString()} mi</p>
                                            <p className="text-aviation-muted text-xs flex items-center gap-1 justify-end">
                                                <Clock className="w-3 h-3" />
                                                {flight.duration}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] ${flight.class === 'first' ? 'bg-yellow-500/20 text-yellow-400' :
                                            flight.class === 'business' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-aviation-border text-aviation-muted'
                                            }`}>
                                            {flight.class.toUpperCase()}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(flight)}
                                                className="p-1.5 bg-aviation-dark rounded hover:bg-aviation-red transition-colors"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(flight.id)}
                                                className="p-1.5 bg-aviation-dark rounded hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddModalOpen(false)}
                    >
                        <motion.div
                            className="w-full max-w-lg bg-aviation-darker border border-aviation-border rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-aviation-border flex items-center justify-between sticky top-0 bg-aviation-darker z-10">
                                <h3 className="font-roboto-condensed font-bold text-lg">
                                    {editingFlight ? 'Edit Flight' : 'Add Flight'}
                                </h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-2 hover:bg-aviation-border rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-aviation-muted block mb-1">Date</label>
                                        <input
                                            type="date"
                                            className="input-field w-full"
                                            value={formData.date}
                                            onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-aviation-muted block mb-1">
                                            Flight Number <span className="text-aviation-red">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="e.g. BA178"
                                            value={formData.flightNumber}
                                            onChange={e => setFormData(f => ({ ...f, flightNumber: e.target.value.toUpperCase() }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-aviation-muted block mb-1">Airline</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        placeholder="e.g. British Airways"
                                        value={formData.airline}
                                        onChange={e => setFormData(f => ({ ...f, airline: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-aviation-muted block mb-1">
                                            Origin IATA <span className="text-aviation-red">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="JFK"
                                            maxLength={3}
                                            value={formData.originIata}
                                            onChange={e => setFormData(f => ({ ...f, originIata: e.target.value.toUpperCase() }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-aviation-muted block mb-1">Origin City</label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="New York"
                                            value={formData.originCity}
                                            onChange={e => setFormData(f => ({ ...f, originCity: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-aviation-muted block mb-1">
                                            Destination IATA <span className="text-aviation-red">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="LHR"
                                            maxLength={3}
                                            value={formData.destIata}
                                            onChange={e => setFormData(f => ({ ...f, destIata: e.target.value.toUpperCase() }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-aviation-muted block mb-1">Destination City</label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="London"
                                            value={formData.destCity}
                                            onChange={e => setFormData(f => ({ ...f, destCity: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-aviation-muted block mb-1">Distance (miles)</label>
                                        <input
                                            type="number"
                                            className="input-field w-full"
                                            placeholder="5541"
                                            value={formData.distance}
                                            onChange={e => setFormData(f => ({ ...f, distance: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-aviation-muted block mb-1">Duration</label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="7h 15m"
                                            value={formData.duration}
                                            onChange={e => setFormData(f => ({ ...f, duration: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-aviation-muted block mb-1">Aircraft</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        placeholder="Boeing 777-300ER"
                                        value={formData.aircraft}
                                        onChange={e => setFormData(f => ({ ...f, aircraft: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-aviation-muted block mb-2">Class</label>
                                    <div className="flex gap-2">
                                        {(['economy', 'business', 'first'] as const).map(cls => (
                                            <button
                                                key={cls}
                                                type="button"
                                                onClick={() => setFormData(f => ({ ...f, class: cls }))}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.class === cls
                                                    ? cls === 'first' ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500' :
                                                        cls === 'business' ? 'bg-blue-500/30 text-blue-400 border border-blue-500' :
                                                            'bg-aviation-dark text-white border border-aviation-muted'
                                                    : 'bg-aviation-dark border border-aviation-border text-aviation-muted'
                                                    }`}
                                            >
                                                {cls.charAt(0).toUpperCase() + cls.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-aviation-border flex gap-3 sticky bottom-0 bg-aviation-darker">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="btn-primary flex-1">
                                    {editingFlight ? 'Update' : 'Save'} Flight
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
