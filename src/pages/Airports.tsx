import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    MapPin,
    X,
    ExternalLink,
    TrendingUp,
    AlertTriangle,
    Plane,
    Filter,
    Globe,
    Clock,
    ChevronDown
} from 'lucide-react'

// Comprehensive airport data - 50 major airports worldwide
const allAirports = [
    // North America
    { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', region: 'North America', latitude: 40.6413, longitude: -73.7781, otpPercent: 74.2, avgDelay: 18.5, totalFlights: 1250, riskScore: 35.5, wikiLink: 'https://en.wikipedia.org/wiki/John_F._Kennedy_International_Airport', activeIncidents: 2 },
    { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', region: 'North America', latitude: 33.9425, longitude: -118.4081, otpPercent: 76.8, avgDelay: 15.2, totalFlights: 1450, riskScore: 28.3, wikiLink: 'https://en.wikipedia.org/wiki/Los_Angeles_International_Airport', activeIncidents: 1 },
    { iata: 'ORD', icao: 'KORD', name: "O'Hare International Airport", city: 'Chicago', country: 'USA', region: 'North America', latitude: 41.9742, longitude: -87.9073, otpPercent: 71.5, avgDelay: 22.1, totalFlights: 1380, riskScore: 42.8, wikiLink: 'https://en.wikipedia.org/wiki/O%27Hare_International_Airport', activeIncidents: 0 },
    { iata: 'DFW', icao: 'KDFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', region: 'North America', latitude: 32.8998, longitude: -97.0403, otpPercent: 79.5, avgDelay: 13.2, totalFlights: 1420, riskScore: 27.4, wikiLink: 'https://en.wikipedia.org/wiki/Dallas/Fort_Worth_International_Airport', activeIncidents: 0 },
    { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA', region: 'North America', latitude: 33.6407, longitude: -84.4277, otpPercent: 77.8, avgDelay: 14.5, totalFlights: 2500, riskScore: 32.1, wikiLink: 'https://en.wikipedia.org/wiki/Hartsfield-Jackson_Atlanta_International_Airport', activeIncidents: 0 },
    { iata: 'DEN', icao: 'KDEN', name: 'Denver International Airport', city: 'Denver', country: 'USA', region: 'North America', latitude: 39.8561, longitude: -104.6737, otpPercent: 75.2, avgDelay: 16.8, totalFlights: 1650, riskScore: 38.2, wikiLink: 'https://en.wikipedia.org/wiki/Denver_International_Airport', activeIncidents: 1 },
    { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', region: 'North America', latitude: 37.6213, longitude: -122.3790, otpPercent: 73.8, avgDelay: 19.2, totalFlights: 1150, riskScore: 41.5, wikiLink: 'https://en.wikipedia.org/wiki/San_Francisco_International_Airport', activeIncidents: 0 },
    { iata: 'SEA', icao: 'KSEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA', region: 'North America', latitude: 47.4502, longitude: -122.3088, otpPercent: 78.5, avgDelay: 14.2, totalFlights: 980, riskScore: 28.5, wikiLink: 'https://en.wikipedia.org/wiki/Seattle-Tacoma_International_Airport', activeIncidents: 0 },
    { iata: 'MIA', icao: 'KMIA', name: 'Miami International Airport', city: 'Miami', country: 'USA', region: 'North America', latitude: 25.7959, longitude: -80.2870, otpPercent: 76.2, avgDelay: 15.8, totalFlights: 1120, riskScore: 31.2, wikiLink: 'https://en.wikipedia.org/wiki/Miami_International_Airport', activeIncidents: 0 },
    { iata: 'BOS', icao: 'KBOS', name: 'Logan International Airport', city: 'Boston', country: 'USA', region: 'North America', latitude: 42.3656, longitude: -71.0096, otpPercent: 74.8, avgDelay: 16.5, totalFlights: 890, riskScore: 33.8, wikiLink: 'https://en.wikipedia.org/wiki/Logan_International_Airport', activeIncidents: 0 },
    { iata: 'EWR', icao: 'KEWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'USA', region: 'North America', latitude: 40.6895, longitude: -74.1745, otpPercent: 72.1, avgDelay: 19.8, totalFlights: 1050, riskScore: 39.5, wikiLink: 'https://en.wikipedia.org/wiki/Newark_Liberty_International_Airport', activeIncidents: 1 },
    { iata: 'PHX', icao: 'KPHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'USA', region: 'North America', latitude: 33.4373, longitude: -112.0078, otpPercent: 81.2, avgDelay: 11.5, totalFlights: 1180, riskScore: 22.5, wikiLink: 'https://en.wikipedia.org/wiki/Phoenix_Sky_Harbor_International_Airport', activeIncidents: 0 },
    { iata: 'IAH', icao: 'KIAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'USA', region: 'North America', latitude: 29.9902, longitude: -95.3368, otpPercent: 77.5, avgDelay: 14.8, totalFlights: 1350, riskScore: 29.8, wikiLink: 'https://en.wikipedia.org/wiki/George_Bush_Intercontinental_Airport', activeIncidents: 0 },
    { iata: 'MSP', icao: 'KMSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', country: 'USA', region: 'North America', latitude: 44.8848, longitude: -93.2223, otpPercent: 79.8, avgDelay: 12.8, totalFlights: 920, riskScore: 26.2, wikiLink: 'https://en.wikipedia.org/wiki/Minneapolis-Saint_Paul_International_Airport', activeIncidents: 0 },
    { iata: 'DTW', icao: 'KDTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', country: 'USA', region: 'North America', latitude: 42.2162, longitude: -83.3554, otpPercent: 78.2, avgDelay: 13.5, totalFlights: 840, riskScore: 27.8, wikiLink: 'https://en.wikipedia.org/wiki/Detroit_Metropolitan_Wayne_County_Airport', activeIncidents: 0 },
    { iata: 'YYZ', icao: 'CYYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', region: 'North America', latitude: 43.6777, longitude: -79.6248, otpPercent: 75.5, avgDelay: 16.2, totalFlights: 1280, riskScore: 32.5, wikiLink: 'https://en.wikipedia.org/wiki/Toronto_Pearson_International_Airport', activeIncidents: 0 },
    { iata: 'YVR', icao: 'CYVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', region: 'North America', latitude: 49.1967, longitude: -123.1815, otpPercent: 80.1, avgDelay: 12.2, totalFlights: 720, riskScore: 24.8, wikiLink: 'https://en.wikipedia.org/wiki/Vancouver_International_Airport', activeIncidents: 0 },
    { iata: 'MEX', icao: 'MMMX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', region: 'North America', latitude: 19.4361, longitude: -99.0719, otpPercent: 74.2, avgDelay: 17.5, totalFlights: 1100, riskScore: 35.2, wikiLink: 'https://en.wikipedia.org/wiki/Mexico_City_International_Airport', activeIncidents: 0 },
    // Europe
    { iata: 'LHR', icao: 'EGLL', name: 'Heathrow Airport', city: 'London', country: 'UK', region: 'Europe', latitude: 51.4700, longitude: -0.4543, otpPercent: 78.3, avgDelay: 14.8, totalFlights: 1320, riskScore: 31.2, wikiLink: 'https://en.wikipedia.org/wiki/Heathrow_Airport', activeIncidents: 0 },
    { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', region: 'Europe', latitude: 49.0097, longitude: 2.5479, otpPercent: 76.5, avgDelay: 15.8, totalFlights: 1280, riskScore: 33.5, wikiLink: 'https://en.wikipedia.org/wiki/Charles_de_Gaulle_Airport', activeIncidents: 0 },
    { iata: 'FRA', icao: 'EDDF', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'Europe', latitude: 50.0379, longitude: 8.5622, otpPercent: 80.1, avgDelay: 12.5, totalFlights: 1180, riskScore: 25.6, wikiLink: 'https://en.wikipedia.org/wiki/Frankfurt_Airport', activeIncidents: 0 },
    { iata: 'AMS', icao: 'EHAM', name: 'Amsterdam Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', region: 'Europe', latitude: 52.3105, longitude: 4.7683, otpPercent: 79.2, avgDelay: 13.2, totalFlights: 1150, riskScore: 27.5, wikiLink: 'https://en.wikipedia.org/wiki/Amsterdam_Airport_Schiphol', activeIncidents: 0 },
    { iata: 'MAD', icao: 'LEMD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', region: 'Europe', latitude: 40.4983, longitude: -3.5676, otpPercent: 77.8, avgDelay: 14.5, totalFlights: 980, riskScore: 29.8, wikiLink: 'https://en.wikipedia.org/wiki/Adolfo_Suarez_Madrid-Barajas_Airport', activeIncidents: 0 },
    { iata: 'BCN', icao: 'LEBL', name: 'Barcelona El Prat Airport', city: 'Barcelona', country: 'Spain', region: 'Europe', latitude: 41.2974, longitude: 2.0833, otpPercent: 78.5, avgDelay: 13.8, totalFlights: 920, riskScore: 28.2, wikiLink: 'https://en.wikipedia.org/wiki/Barcelona-El_Prat_Airport', activeIncidents: 0 },
    { iata: 'FCO', icao: 'LIRF', name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome', country: 'Italy', region: 'Europe', latitude: 41.8003, longitude: 12.2389, otpPercent: 75.2, avgDelay: 16.2, totalFlights: 850, riskScore: 32.8, wikiLink: 'https://en.wikipedia.org/wiki/Leonardo_da_Vinci-Fiumicino_Airport', activeIncidents: 0 },
    { iata: 'MUC', icao: 'EDDM', name: 'Munich Airport', city: 'Munich', country: 'Germany', region: 'Europe', latitude: 48.3537, longitude: 11.7750, otpPercent: 81.5, avgDelay: 11.2, totalFlights: 920, riskScore: 23.5, wikiLink: 'https://en.wikipedia.org/wiki/Munich_Airport', activeIncidents: 0 },
    { iata: 'ZRH', icao: 'LSZH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', region: 'Europe', latitude: 47.4582, longitude: 8.5555, otpPercent: 82.1, avgDelay: 10.8, totalFlights: 720, riskScore: 22.2, wikiLink: 'https://en.wikipedia.org/wiki/Zurich_Airport', activeIncidents: 0 },
    { iata: 'VIE', icao: 'LOWW', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', region: 'Europe', latitude: 48.1103, longitude: 16.5697, otpPercent: 80.8, avgDelay: 11.5, totalFlights: 680, riskScore: 24.2, wikiLink: 'https://en.wikipedia.org/wiki/Vienna_International_Airport', activeIncidents: 0 },
    { iata: 'CPH', icao: 'EKCH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', region: 'Europe', latitude: 55.6180, longitude: 12.6561, otpPercent: 79.5, avgDelay: 12.5, totalFlights: 640, riskScore: 26.5, wikiLink: 'https://en.wikipedia.org/wiki/Copenhagen_Airport', activeIncidents: 0 },
    { iata: 'DUB', icao: 'EIDW', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', region: 'Europe', latitude: 53.4264, longitude: -6.2499, otpPercent: 78.2, avgDelay: 13.8, totalFlights: 580, riskScore: 28.8, wikiLink: 'https://en.wikipedia.org/wiki/Dublin_Airport', activeIncidents: 0 },
    { iata: 'IST', icao: 'LTFM', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', region: 'Europe', latitude: 41.2753, longitude: 28.7519, otpPercent: 77.8, avgDelay: 14.2, totalFlights: 1280, riskScore: 29.5, wikiLink: 'https://en.wikipedia.org/wiki/Istanbul_Airport', activeIncidents: 0 },
    // Asia Pacific
    { iata: 'HND', icao: 'RJTT', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', region: 'Asia Pacific', latitude: 35.5494, longitude: 139.7798, otpPercent: 88.5, avgDelay: 6.8, totalFlights: 1450, riskScore: 15.2, wikiLink: 'https://en.wikipedia.org/wiki/Haneda_Airport', activeIncidents: 0 },
    { iata: 'NRT', icao: 'RJAA', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', region: 'Asia Pacific', latitude: 35.7720, longitude: 140.3929, otpPercent: 86.2, avgDelay: 8.5, totalFlights: 1280, riskScore: 18.5, wikiLink: 'https://en.wikipedia.org/wiki/Narita_International_Airport', activeIncidents: 0 },
    { iata: 'PEK', icao: 'ZBAA', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', region: 'Asia Pacific', latitude: 40.0799, longitude: 116.6031, otpPercent: 72.5, avgDelay: 18.8, totalFlights: 1650, riskScore: 38.2, wikiLink: 'https://en.wikipedia.org/wiki/Beijing_Capital_International_Airport', activeIncidents: 0 },
    { iata: 'PVG', icao: 'ZSPD', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', region: 'Asia Pacific', latitude: 31.1443, longitude: 121.8083, otpPercent: 74.8, avgDelay: 17.2, totalFlights: 1520, riskScore: 35.8, wikiLink: 'https://en.wikipedia.org/wiki/Shanghai_Pudong_International_Airport', activeIncidents: 0 },
    { iata: 'HKG', icao: 'VHHH', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China', region: 'Asia Pacific', latitude: 22.3080, longitude: 113.9185, otpPercent: 81.2, avgDelay: 11.8, totalFlights: 1180, riskScore: 24.5, wikiLink: 'https://en.wikipedia.org/wiki/Hong_Kong_International_Airport', activeIncidents: 0 },
    { iata: 'SIN', icao: 'WSSS', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', region: 'Asia Pacific', latitude: 1.3644, longitude: 103.9915, otpPercent: 85.8, avgDelay: 8.2, totalFlights: 980, riskScore: 17.8, wikiLink: 'https://en.wikipedia.org/wiki/Singapore_Changi_Airport', activeIncidents: 0 },
    { iata: 'ICN', icao: 'RKSI', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', region: 'Asia Pacific', latitude: 37.4602, longitude: 126.4407, otpPercent: 84.5, avgDelay: 9.5, totalFlights: 1120, riskScore: 19.8, wikiLink: 'https://en.wikipedia.org/wiki/Incheon_International_Airport', activeIncidents: 0 },
    { iata: 'BKK', icao: 'VTBS', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', region: 'Asia Pacific', latitude: 13.6900, longitude: 100.7501, otpPercent: 78.2, avgDelay: 14.5, totalFlights: 980, riskScore: 29.2, wikiLink: 'https://en.wikipedia.org/wiki/Suvarnabhumi_Airport', activeIncidents: 0 },
    { iata: 'SYD', icao: 'YSSY', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', region: 'Asia Pacific', latitude: -33.9399, longitude: 151.1753, otpPercent: 79.5, avgDelay: 13.2, totalFlights: 920, riskScore: 27.2, wikiLink: 'https://en.wikipedia.org/wiki/Sydney_Airport', activeIncidents: 0 },
    { iata: 'MEL', icao: 'YMML', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', region: 'Asia Pacific', latitude: -37.6690, longitude: 144.8410, otpPercent: 80.2, avgDelay: 12.5, totalFlights: 780, riskScore: 25.8, wikiLink: 'https://en.wikipedia.org/wiki/Melbourne_Airport', activeIncidents: 0 },
    { iata: 'DEL', icao: 'VIDP', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', region: 'Asia Pacific', latitude: 28.5562, longitude: 77.1000, otpPercent: 75.8, avgDelay: 16.8, totalFlights: 1350, riskScore: 34.2, wikiLink: 'https://en.wikipedia.org/wiki/Indira_Gandhi_International_Airport', activeIncidents: 0 },
    { iata: 'BOM', icao: 'VABB', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', region: 'Asia Pacific', latitude: 19.0896, longitude: 72.8656, otpPercent: 74.2, avgDelay: 17.8, totalFlights: 1180, riskScore: 36.5, wikiLink: 'https://en.wikipedia.org/wiki/Chhatrapati_Shivaji_Maharaj_International_Airport', activeIncidents: 0 },
    // Middle East
    { iata: 'DXB', icao: 'OMDB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', region: 'Middle East', latitude: 25.2532, longitude: 55.3657, otpPercent: 82.5, avgDelay: 10.5, totalFlights: 1450, riskScore: 22.8, wikiLink: 'https://en.wikipedia.org/wiki/Dubai_International_Airport', activeIncidents: 0 },
    { iata: 'DOH', icao: 'OTHH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', region: 'Middle East', latitude: 25.2609, longitude: 51.6138, otpPercent: 84.2, avgDelay: 9.2, totalFlights: 850, riskScore: 20.2, wikiLink: 'https://en.wikipedia.org/wiki/Hamad_International_Airport', activeIncidents: 0 },
    { iata: 'AUH', icao: 'OMAA', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'UAE', region: 'Middle East', latitude: 24.4330, longitude: 54.6511, otpPercent: 83.5, avgDelay: 9.8, totalFlights: 720, riskScore: 21.5, wikiLink: 'https://en.wikipedia.org/wiki/Abu_Dhabi_International_Airport', activeIncidents: 0 },
    // South America
    { iata: 'GRU', icao: 'SBGR', name: 'São Paulo Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', region: 'South America', latitude: -23.4356, longitude: -46.4731, otpPercent: 73.5, avgDelay: 18.2, totalFlights: 980, riskScore: 37.5, wikiLink: 'https://en.wikipedia.org/wiki/S%C3%A3o_Paulo-Guarulhos_International_Airport', activeIncidents: 0 },
    { iata: 'EZE', icao: 'SAEZ', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', region: 'South America', latitude: -34.8222, longitude: -58.5358, otpPercent: 74.8, avgDelay: 16.8, totalFlights: 620, riskScore: 34.2, wikiLink: 'https://en.wikipedia.org/wiki/Ministro_Pistarini_International_Airport', activeIncidents: 0 },
    { iata: 'SCL', icao: 'SCEL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', region: 'South America', latitude: -33.3930, longitude: -70.7858, otpPercent: 78.2, avgDelay: 14.2, totalFlights: 580, riskScore: 28.8, wikiLink: 'https://en.wikipedia.org/wiki/Arturo_Merino_Ben%C3%ADtez_International_Airport', activeIncidents: 0 },
    { iata: 'BOG', icao: 'SKBO', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', region: 'South America', latitude: 4.7016, longitude: -74.1469, otpPercent: 76.5, avgDelay: 15.5, totalFlights: 680, riskScore: 31.2, wikiLink: 'https://en.wikipedia.org/wiki/El_Dorado_International_Airport', activeIncidents: 0 },
]

const regions = ['All Regions', 'North America', 'Europe', 'Asia Pacific', 'Middle East', 'South America']

interface Airport {
    iata: string
    icao: string
    name: string
    city: string
    country: string
    region: string
    latitude: number
    longitude: number
    otpPercent: number
    avgDelay: number
    totalFlights: number
    riskScore: number
    wikiLink: string
    activeIncidents: number
}

export default function Airports() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
    const [selectedRegion, setSelectedRegion] = useState('All Regions')
    const [sortBy, setSortBy] = useState<'totalFlights' | 'otpPercent' | 'avgDelay' | 'riskScore'>('totalFlights')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12

    const filteredAirports = useMemo(() => {
        let result = allAirports.filter(airport => {
            const matchesSearch = searchQuery === '' ||
                airport.iata.toLowerCase().includes(searchQuery.toLowerCase()) ||
                airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                airport.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                airport.country.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesRegion = selectedRegion === 'All Regions' || airport.region === selectedRegion

            return matchesSearch && matchesRegion
        })

        result.sort((a, b) => {
            const aVal = a[sortBy]
            const bVal = b[sortBy]
            return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
        })

        return result
    }, [searchQuery, selectedRegion, sortBy, sortOrder])

    const paginatedAirports = filteredAirports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const totalPages = Math.ceil(filteredAirports.length / itemsPerPage)

    const handleSort = (field: typeof sortBy) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-roboto-condensed text-2xl font-bold">Airports</h1>
                    <p className="text-aviation-muted text-sm mt-1">
                        {filteredAirports.length} airports tracked worldwide
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aviation-muted" />
                        <input
                            type="text"
                            placeholder="Search by IATA, name, city, or country..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                            className="input-field w-full pl-10"
                        />
                    </div>

                    {/* Region Filter */}
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-aviation-muted" />
                        <select
                            value={selectedRegion}
                            onChange={(e) => { setSelectedRegion(e.target.value); setCurrentPage(1) }}
                            className="input-field py-2 pr-8"
                        >
                            {regions.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-aviation-muted" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="input-field py-2 pr-8"
                        >
                            <option value="totalFlights">Total Flights</option>
                            <option value="otpPercent">OTP %</option>
                            <option value="avgDelay">Avg Delay</option>
                            <option value="riskScore">Risk Score</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="p-2 rounded-lg bg-aviation-darker border border-aviation-border hover:border-aviation-red transition-colors"
                        >
                            <ChevronDown className={`w-4 h-4 text-aviation-muted transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Airports Table */}
            <motion.div
                className="card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-aviation-border">
                                <th className="table-header text-left p-4">Airport</th>
                                <th className="table-header text-left p-4">Location</th>
                                <th className="table-header text-right p-4 cursor-pointer hover:text-white" onClick={() => handleSort('otpPercent')}>
                                    OTP %
                                </th>
                                <th className="table-header text-right p-4 cursor-pointer hover:text-white" onClick={() => handleSort('avgDelay')}>
                                    Avg Delay
                                </th>
                                <th className="table-header text-right p-4 cursor-pointer hover:text-white" onClick={() => handleSort('totalFlights')}>
                                    Flights
                                </th>
                                <th className="table-header text-right p-4 cursor-pointer hover:text-white" onClick={() => handleSort('riskScore')}>
                                    Risk
                                </th>
                                <th className="table-header text-center p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {paginatedAirports.map((airport, index) => (
                                    <motion.tr
                                        key={airport.iata}
                                        layout
                                        className="border-b border-aviation-border/50 hover:bg-aviation-darker cursor-pointer transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.02 }}
                                        onClick={() => setSelectedAirport(airport)}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-aviation-darker rounded-lg flex items-center justify-center border border-aviation-border">
                                                    <MapPin className="w-5 h-5 text-aviation-red" />
                                                </div>
                                                <div>
                                                    <p className="font-jetbrains font-bold text-aviation-red">{airport.iata}</p>
                                                    <p className="text-xs text-aviation-muted truncate max-w-[180px]">{airport.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white">{airport.city}</p>
                                            <p className="text-xs text-aviation-muted">{airport.country}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`font-jetbrains font-medium ${airport.otpPercent >= 80 ? 'text-green-400' :
                                                    airport.otpPercent >= 75 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                {airport.otpPercent.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`font-jetbrains ${airport.avgDelay <= 12 ? 'text-green-400' :
                                                    airport.avgDelay <= 16 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                {airport.avgDelay.toFixed(0)}m
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-jetbrains text-white">
                                            {airport.totalFlights.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`font-jetbrains ${airport.riskScore <= 25 ? 'text-green-400' :
                                                    airport.riskScore <= 35 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                {airport.riskScore.toFixed(0)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {airport.activeIncidents > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {airport.activeIncidents}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs border border-green-500/20">
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-aviation-border flex items-center justify-between">
                    <p className="text-sm text-aviation-muted">
                        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAirports.length)} of {filteredAirports.length} airports
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-aviation-muted">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Airport Detail Modal */}
            <AnimatePresence>
                {selectedAirport && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedAirport(null)}
                    >
                        <motion.div
                            className="bg-aviation-dark border border-aviation-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-aviation-red p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-roboto-condensed text-xl font-bold text-white">
                                            {selectedAirport.iata} - {selectedAirport.name}
                                        </h2>
                                        <p className="text-white/80 text-sm">
                                            {selectedAirport.city}, {selectedAirport.country}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAirport(null)}
                                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-aviation-darker rounded-xl p-4 border border-aviation-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4 text-aviation-red" />
                                            <p className="text-xs text-aviation-muted">On-Time Rate</p>
                                        </div>
                                        <p className={`text-2xl font-roboto-condensed font-bold ${selectedAirport.otpPercent >= 80 ? 'text-green-400' :
                                                selectedAirport.otpPercent >= 75 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {selectedAirport.otpPercent.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="bg-aviation-darker rounded-xl p-4 border border-aviation-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-aviation-red" />
                                            <p className="text-xs text-aviation-muted">Avg Delay</p>
                                        </div>
                                        <p className="text-2xl font-roboto-condensed font-bold text-white">{selectedAirport.avgDelay.toFixed(0)}m</p>
                                    </div>
                                    <div className="bg-aviation-darker rounded-xl p-4 border border-aviation-border">
                                        <p className="text-xs text-aviation-muted mb-2">Daily Flights</p>
                                        <p className="text-2xl font-roboto-condensed font-bold text-white">{selectedAirport.totalFlights.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-aviation-darker rounded-xl p-4 border border-aviation-border">
                                        <p className="text-xs text-aviation-muted mb-2">Risk Score</p>
                                        <p className={`text-2xl font-roboto-condensed font-bold ${selectedAirport.riskScore <= 25 ? 'text-green-400' :
                                                selectedAirport.riskScore <= 35 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {selectedAirport.riskScore.toFixed(1)}
                                        </p>
                                    </div>
                                </div>

                                {/* Airport Details */}
                                <div className="bg-aviation-darker rounded-xl p-4 border border-aviation-border">
                                    <h3 className="font-roboto-condensed font-bold mb-3">Airport Information</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-aviation-muted">ICAO Code</p>
                                            <p className="font-jetbrains text-white">{selectedAirport.icao}</p>
                                        </div>
                                        <div>
                                            <p className="text-aviation-muted">Region</p>
                                            <p className="text-white">{selectedAirport.region}</p>
                                        </div>
                                        <div>
                                            <p className="text-aviation-muted">Coordinates</p>
                                            <p className="font-jetbrains text-white">
                                                {selectedAirport.latitude.toFixed(4)}, {selectedAirport.longitude.toFixed(4)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-aviation-muted">Status</p>
                                            <p className={selectedAirport.activeIncidents > 0 ? 'text-red-400' : 'text-green-400'}>
                                                {selectedAirport.activeIncidents > 0 ? `${selectedAirport.activeIncidents} Active Incidents` : 'Normal Operations'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href={selectedAirport.wikiLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Wikipedia
                                    </a>
                                    <button className="btn-secondary flex items-center gap-2">
                                        <Plane className="w-4 h-4" />
                                        View Departures
                                    </button>
                                    <button className="btn-secondary flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        View Routes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
