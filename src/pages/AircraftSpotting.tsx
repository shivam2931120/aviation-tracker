import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Camera,
    Plane,
    MapPin,
    Calendar,
    Star,
    Plus,
    Search,
    Award,
    CheckCircle,
    X,
    Upload,
    Trash2,
    Edit2,
    Image
} from 'lucide-react'

interface SpottedAircraft {
    id: string
    callsign: string
    registration: string
    aircraftType: string
    airline: string
    airport: string
    date: string
    time: string
    notes: string
    photo?: string
    rating: number
    verified: boolean
}

// Load from localStorage or use defaults
const getStoredSpottings = (): SpottedAircraft[] => {
    const stored = localStorage.getItem('aircraftSpottings')
    if (stored) {
        return JSON.parse(stored)
    }
    return [
        {
            id: '1',
            callsign: 'BA178',
            registration: 'G-STBK',
            aircraftType: 'Boeing 777-300ER',
            airline: 'British Airways',
            airport: 'JFK - New York',
            date: '2024-01-07',
            time: '14:30',
            notes: 'Beautiful takeoff with sunset backdrop',
            rating: 5,
            verified: true
        },
        {
            id: '2',
            callsign: 'EK203',
            registration: 'A6-EVH',
            aircraftType: 'Airbus A380-800',
            airline: 'Emirates',
            airport: 'DXB - Dubai',
            date: '2024-01-05',
            time: '09:15',
            notes: 'First A380 spotting!',
            rating: 5,
            verified: true
        },
        {
            id: '3',
            callsign: 'LH400',
            registration: 'D-AIMD',
            aircraftType: 'Airbus A380-800',
            airline: 'Lufthansa',
            airport: 'FRA - Frankfurt',
            date: '2024-01-03',
            time: '11:45',
            notes: 'Rare Lufthansa A380',
            rating: 4,
            verified: false
        }
    ]
}

export default function AircraftSpotting() {
    const [spottings, setSpottings] = useState<SpottedAircraft[]>(getStoredSpottings)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingSpotting, setEditingSpotting] = useState<SpottedAircraft | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'verified' | 'unverified'>('all')

    // Form state
    const [formData, setFormData] = useState({
        callsign: '',
        registration: '',
        aircraftType: '',
        airline: '',
        airport: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        notes: '',
        rating: 5
    })

    // Save to localStorage whenever spottings change
    useEffect(() => {
        localStorage.setItem('aircraftSpottings', JSON.stringify(spottings))
    }, [spottings])

    // Stats
    const totalSpottings = spottings.length
    const verifiedCount = spottings.filter(s => s.verified).length
    const uniqueAircraft = new Set(spottings.map(s => s.aircraftType)).size
    const uniqueAirlines = new Set(spottings.map(s => s.airline)).size

    const filteredSpottings = spottings.filter(s => {
        const matchesSearch = !searchQuery ||
            s.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.aircraftType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.airline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.airport.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterType === 'all' ||
            (filterType === 'verified' && s.verified) ||
            (filterType === 'unverified' && !s.verified)

        return matchesSearch && matchesFilter
    })

    const resetForm = () => {
        setFormData({
            callsign: '',
            registration: '',
            aircraftType: '',
            airline: '',
            airport: '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            notes: '',
            rating: 5
        })
        setEditingSpotting(null)
    }

    const openAddModal = () => {
        resetForm()
        setIsAddModalOpen(true)
    }

    const openEditModal = (spotting: SpottedAircraft) => {
        setEditingSpotting(spotting)
        setFormData({
            callsign: spotting.callsign,
            registration: spotting.registration,
            aircraftType: spotting.aircraftType,
            airline: spotting.airline,
            airport: spotting.airport,
            date: spotting.date,
            time: spotting.time,
            notes: spotting.notes,
            rating: spotting.rating
        })
        setIsAddModalOpen(true)
    }

    const handleSave = () => {
        if (!formData.callsign || !formData.aircraftType) {
            alert('Please fill in required fields (Callsign and Aircraft Type)')
            return
        }

        if (editingSpotting) {
            // Update existing
            setSpottings(prev => prev.map(s =>
                s.id === editingSpotting.id
                    ? { ...s, ...formData, verified: s.verified }
                    : s
            ))
        } else {
            // Add new
            const newSpotting: SpottedAircraft = {
                id: Date.now().toString(),
                ...formData,
                verified: false
            }
            setSpottings(prev => [newSpotting, ...prev])
        }

        setIsAddModalOpen(false)
        resetForm()
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this spotting?')) {
            setSpottings(prev => prev.filter(s => s.id !== id))
        }
    }

    const toggleVerified = (id: string) => {
        setSpottings(prev => prev.map(s =>
            s.id === id ? { ...s, verified: !s.verified } : s
        ))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="font-roboto-condensed text-2xl font-bold flex items-center gap-2">
                        <Camera className="w-6 h-6 text-aviation-red" />
                        Aircraft Spotting
                    </h1>
                    <p className="text-aviation-muted text-sm">Track and log your aircraft sightings</p>
                </div>
                <button onClick={openAddModal} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Add Spotting
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    className="card p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-aviation-red/20 rounded-lg">
                            <Camera className="w-5 h-5 text-aviation-red" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed">{totalSpottings}</p>
                            <p className="text-aviation-muted text-xs">Total Spottings</p>
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
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-green-400">{verifiedCount}</p>
                            <p className="text-aviation-muted text-xs">Verified</p>
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
                            <Plane className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-blue-400">{uniqueAircraft}</p>
                            <p className="text-aviation-muted text-xs">Aircraft Types</p>
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
                            <Award className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-roboto-condensed text-yellow-400">{uniqueAirlines}</p>
                            <p className="text-aviation-muted text-xs">Airlines</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aviation-muted" />
                    <input
                        type="text"
                        placeholder="Search by callsign, aircraft, airline, or airport..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input-field w-full pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'verified', 'unverified'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterType(f as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === f
                                    ? 'bg-aviation-red text-white'
                                    : 'bg-aviation-darker border border-aviation-border text-aviation-muted hover:text-white'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Spottings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {filteredSpottings.map((spotting, i) => (
                        <motion.div
                            key={spotting.id}
                            className="card overflow-hidden hover-lift group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            layout
                        >
                            {/* Photo placeholder */}
                            <div className="h-40 bg-gradient-to-br from-aviation-dark to-aviation-darker flex items-center justify-center relative">
                                {spotting.photo ? (
                                    <img src={spotting.photo} alt={spotting.callsign} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <Camera className="w-10 h-10 text-aviation-muted mx-auto mb-2" />
                                        <p className="text-aviation-muted text-xs">No photo</p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(spotting)}
                                        className="p-1.5 bg-black/70 rounded-lg hover:bg-aviation-red transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(spotting.id)}
                                        className="p-1.5 bg-black/70 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-jetbrains font-bold text-aviation-red">{spotting.callsign}</span>
                                        <button
                                            onClick={() => toggleVerified(spotting.id)}
                                            title={spotting.verified ? 'Click to unverify' : 'Click to verify'}
                                        >
                                            {spotting.verified ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 text-aviation-muted opacity-50" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < spotting.rating ? 'text-yellow-400 fill-yellow-400' : 'text-aviation-muted'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Details */}
                                <p className="text-white font-medium">{spotting.aircraftType}</p>
                                <p className="text-aviation-muted text-sm">{spotting.airline}</p>
                                {spotting.registration && (
                                    <p className="text-aviation-muted text-xs font-jetbrains mt-1">Reg: {spotting.registration}</p>
                                )}

                                <div className="flex items-center gap-4 mt-3 text-xs text-aviation-muted">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {spotting.airport}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {spotting.date}
                                    </div>
                                </div>

                                {spotting.notes && (
                                    <p className="mt-3 text-sm text-aviation-muted italic line-clamp-2">"{spotting.notes}"</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredSpottings.length === 0 && (
                <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-aviation-muted mx-auto mb-4" />
                    <p className="text-aviation-muted">{searchQuery ? 'No spottings match your search' : 'No spottings yet'}</p>
                    <button onClick={openAddModal} className="btn-primary mt-4">
                        <Plus className="w-4 h-4" />
                        Add Your First Spotting
                    </button>
                </div>
            )}

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
                                    {editingSpotting ? 'Edit Spotting' : 'Add Aircraft Spotting'}
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
                                        <label className="text-sm text-aviation-muted block mb-1">
                                            Callsign <span className="text-aviation-red">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="e.g. BA178"
                                            value={formData.callsign}
                                            onChange={e => setFormData(f => ({ ...f, callsign: e.target.value.toUpperCase() }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-aviation-muted block mb-1">Registration</label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            placeholder="e.g. G-STBK"
                                            value={formData.registration}
                                            onChange={e => setFormData(f => ({ ...f, registration: e.target.value.toUpperCase() }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-aviation-muted block mb-1">
                                        Aircraft Type <span className="text-aviation-red">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        placeholder="e.g. Boeing 777-300ER"
                                        value={formData.aircraftType}
                                        onChange={e => setFormData(f => ({ ...f, aircraftType: e.target.value }))}
                                    />
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
                                <div>
                                    <label className="text-sm text-aviation-muted block mb-1">Airport</label>
                                    <input
                                        type="text"
                                        className="input-field w-full"
                                        placeholder="e.g. JFK - New York"
                                        value={formData.airport}
                                        onChange={e => setFormData(f => ({ ...f, airport: e.target.value }))}
                                    />
                                </div>
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
                                        <label className="text-sm text-aviation-muted block mb-1">Time</label>
                                        <input
                                            type="time"
                                            className="input-field w-full"
                                            value={formData.time}
                                            onChange={e => setFormData(f => ({ ...f, time: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-aviation-muted block mb-1">Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() => setFormData(f => ({ ...f, rating }))}
                                                className="p-1 hover:scale-110 transition-transform"
                                            >
                                                <Star
                                                    className={`w-6 h-6 ${rating <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-aviation-muted'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-aviation-muted block mb-1">Notes</label>
                                    <textarea
                                        className="input-field w-full h-20 resize-none"
                                        placeholder="Add any notes about this spotting..."
                                        value={formData.notes}
                                        onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                                    />
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
                                    {editingSpotting ? 'Update' : 'Save'} Spotting
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
