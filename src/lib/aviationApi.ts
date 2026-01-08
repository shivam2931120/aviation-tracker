import axios from 'axios'

// API Configuration
const OPENSKY_BASE = 'https://opensky-network.org/api'
const AVIATIONSTACK_BASE = 'http://api.aviationstack.com/v1'
const FLIGHTAPI_BASE = 'https://api.flightapi.io'

// Environment variables (from .env)
const AVIATIONSTACK_KEY = import.meta.env.VITE_AVIATIONSTACK_API_KEY
const OPENSKY_USER = import.meta.env.VITE_OPENSKY_CLIENT_ID
const OPENSKY_PASS = import.meta.env.VITE_OPENSKY_CLIENT_SECRET
const FLIGHTAPI_KEY = import.meta.env.VITE_FLIGHTAPI_KEY

// Types
export interface OpenSkyState {
    icao24: string
    callsign: string | null
    origin_country: string
    time_position: number | null
    last_contact: number
    longitude: number | null
    latitude: number | null
    baro_altitude: number | null
    on_ground: boolean
    velocity: number | null
    true_track: number | null
    vertical_rate: number | null
    sensors: number[] | null
    geo_altitude: number | null
    squawk: string | null
    spi: boolean
    position_source: number
}

export interface Flight {
    id: string
    icao24: string
    callsign: string
    originCountry: string
    latitude: number
    longitude: number
    altitude: number | null
    velocity: number | null
    trueTrack: number | null
    onGround: boolean
    status: 'active' | 'grounded' | 'landing'
}

export interface Airport {
    iata: string
    icao: string
    name: string
    city: string
    country: string
    latitude: number
    longitude: number
    timezone: string
}

export interface AirportWithStats extends Airport {
    otpPercent: number
    avgDelay: number
    totalFlights: number
    riskScore: number
    activeIncidents: number
}

// OpenSky API - Get all live flights
export async function fetchLiveFlights(): Promise<Flight[]> {
    try {
        const response = await axios.get(`${OPENSKY_BASE}/states/all`, {
            auth: OPENSKY_USER && OPENSKY_PASS ? {
                username: OPENSKY_USER,
                password: OPENSKY_PASS
            } : undefined,
            timeout: 15000
        })

        if (!response.data?.states) {
            console.warn('No flight states returned from OpenSky')
            return []
        }

        const flights: Flight[] = response.data.states
            .filter((state: any[]) =>
                state[5] !== null && // longitude exists
                state[6] !== null && // latitude exists
                state[1]?.trim() // has callsign
            )
            .slice(0, 500) // Limit to 500 flights for performance
            .map((state: any[], index: number) => ({
                id: `os-${state[0]}-${index}`,
                icao24: state[0],
                callsign: (state[1] || '').trim(),
                originCountry: state[2],
                latitude: state[6],
                longitude: state[5],
                altitude: state[7] ? Math.round(state[7] * 3.28084) : null, // meters to feet
                velocity: state[9] ? Math.round(state[9] * 1.94384) : null, // m/s to knots
                trueTrack: state[10],
                onGround: state[8],
                status: state[8] ? 'grounded' : 'active' as const
            }))

        return flights
    } catch (error) {
        console.error('Error fetching OpenSky data:', error)
        return []
    }
}

// Fetch flights in a specific bounding box
export async function fetchFlightsInArea(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number
): Promise<Flight[]> {
    try {
        const response = await axios.get(`${OPENSKY_BASE}/states/all`, {
            params: {
                lamin: minLat,
                lamax: maxLat,
                lomin: minLon,
                lomax: maxLon
            },
            auth: OPENSKY_USER && OPENSKY_PASS ? {
                username: OPENSKY_USER,
                password: OPENSKY_PASS
            } : undefined,
            timeout: 15000
        })

        if (!response.data?.states) return []

        return response.data.states
            .filter((state: any[]) => state[5] !== null && state[6] !== null)
            .map((state: any[], index: number) => ({
                id: `os-${state[0]}-${index}`,
                icao24: state[0],
                callsign: (state[1] || '').trim(),
                originCountry: state[2],
                latitude: state[6],
                longitude: state[5],
                altitude: state[7] ? Math.round(state[7] * 3.28084) : null,
                velocity: state[9] ? Math.round(state[9] * 1.94384) : null,
                trueTrack: state[10],
                onGround: state[8],
                status: state[8] ? 'grounded' : 'active' as const
            }))
    } catch (error) {
        console.error('Error fetching area flights:', error)
        return []
    }
}

// AviationStack API - Get airport data
export async function fetchAirports(search?: string): Promise<Airport[]> {
    if (!AVIATIONSTACK_KEY) {
        console.warn('AviationStack API key not configured')
        return []
    }

    try {
        const response = await axios.get(`${AVIATIONSTACK_BASE}/airports`, {
            params: {
                access_key: AVIATIONSTACK_KEY,
                search: search || undefined,
                limit: 100
            },
            timeout: 10000
        })

        if (!response.data?.data) return []

        return response.data.data.map((airport: any) => ({
            iata: airport.iata_code,
            icao: airport.icao_code,
            name: airport.airport_name,
            city: airport.city || airport.country_name,
            country: airport.country_name,
            latitude: airport.latitude,
            longitude: airport.longitude,
            timezone: airport.timezone
        }))
    } catch (error) {
        console.error('Error fetching airports:', error)
        return []
    }
}

// AviationStack API - Get real-time flights
export async function fetchRealTimeFlights(airline?: string): Promise<any[]> {
    if (!AVIATIONSTACK_KEY) {
        console.warn('AviationStack API key not configured')
        return []
    }

    try {
        const response = await axios.get(`${AVIATIONSTACK_BASE}/flights`, {
            params: {
                access_key: AVIATIONSTACK_KEY,
                airline_iata: airline || undefined,
                flight_status: 'active',
                limit: 100
            },
            timeout: 10000
        })

        return response.data?.data || []
    } catch (error) {
        console.error('Error fetching real-time flights:', error)
        return []
    }
}

// AviationStack API - Get airlines
export async function fetchAirlines(): Promise<any[]> {
    if (!AVIATIONSTACK_KEY) {
        console.warn('AviationStack API key not configured')
        return []
    }

    try {
        const response = await axios.get(`${AVIATIONSTACK_BASE}/airlines`, {
            params: {
                access_key: AVIATIONSTACK_KEY,
                limit: 100
            },
            timeout: 10000
        })

        return response.data?.data || []
    } catch (error) {
        console.error('Error fetching airlines:', error)
        return []
    }
}

// AviationStack API - Get routes
export async function fetchRoutes(depIata?: string, arrIata?: string): Promise<any[]> {
    if (!AVIATIONSTACK_KEY) {
        console.warn('AviationStack API key not configured')
        return []
    }

    try {
        const response = await axios.get(`${AVIATIONSTACK_BASE}/routes`, {
            params: {
                access_key: AVIATIONSTACK_KEY,
                dep_iata: depIata || undefined,
                arr_iata: arrIata || undefined,
                limit: 100
            },
            timeout: 10000
        })

        return response.data?.data || []
    } catch (error) {
        console.error('Error fetching routes:', error)
        return []
    }
}

// Comprehensive flight tracker using multiple sources
export async function fetchAllFlightData() {
    console.log('Fetching flight data from APIs...')

    // Primary: OpenSky (free, no key needed for anonymous access)
    const openSkyFlights = await fetchLiveFlights()

    // Secondary: AviationStack if key is available
    let aviationStackFlights: any[] = []
    if (AVIATIONSTACK_KEY) {
        aviationStackFlights = await fetchRealTimeFlights()
    }

    console.log(`Fetched ${openSkyFlights.length} OpenSky flights, ${aviationStackFlights.length} AviationStack flights`)

    return {
        openSkyFlights,
        aviationStackFlights,
        totalCount: openSkyFlights.length + aviationStackFlights.length
    }
}

// Get flight by ICAO24 or callsign
export async function getFlightInfo(identifier: string): Promise<Flight | null> {
    try {
        // First try OpenSky
        const response = await axios.get(`${OPENSKY_BASE}/states/all`, {
            params: { icao24: identifier.toLowerCase() },
            auth: OPENSKY_USER && OPENSKY_PASS ? {
                username: OPENSKY_USER,
                password: OPENSKY_PASS
            } : undefined,
            timeout: 10000
        })

        if (response.data?.states?.length > 0) {
            const state = response.data.states[0]
            return {
                id: `os-${state[0]}`,
                icao24: state[0],
                callsign: (state[1] || '').trim(),
                originCountry: state[2],
                latitude: state[6] || 0,
                longitude: state[5] || 0,
                altitude: state[7] ? Math.round(state[7] * 3.28084) : null,
                velocity: state[9] ? Math.round(state[9] * 1.94384) : null,
                trueTrack: state[10],
                onGround: state[8],
                status: state[8] ? 'grounded' : 'active'
            }
        }

        return null
    } catch (error) {
        console.error('Error getting flight info:', error)
        return null
    }
}

// Get aircraft track history
export async function getFlightTrack(icao24: string): Promise<any[]> {
    try {
        const now = Math.floor(Date.now() / 1000)
        const oneHourAgo = now - 3600

        const response = await axios.get(`${OPENSKY_BASE}/tracks/all`, {
            params: {
                icao24: icao24.toLowerCase(),
                time: oneHourAgo
            },
            auth: OPENSKY_USER && OPENSKY_PASS ? {
                username: OPENSKY_USER,
                password: OPENSKY_PASS
            } : undefined,
            timeout: 15000
        })

        return response.data?.path || []
    } catch (error) {
        console.error('Error getting flight track:', error)
        return []
    }
}

// Export stats for dashboard
export function calculateFlightStats(flights: Flight[]) {
    const activeFlights = flights.filter(f => !f.onGround)
    const groundedFlights = flights.filter(f => f.onGround)

    const countryCounts: Record<string, number> = {}
    flights.forEach(f => {
        countryCounts[f.originCountry] = (countryCounts[f.originCountry] || 0) + 1
    })

    const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

    return {
        total: flights.length,
        active: activeFlights.length,
        grounded: groundedFlights.length,
        avgAltitude: Math.round(
            activeFlights.reduce((sum, f) => sum + (f.altitude || 0), 0) / activeFlights.length || 0
        ),
        avgSpeed: Math.round(
            activeFlights.reduce((sum, f) => sum + (f.velocity || 0), 0) / activeFlights.length || 0
        ),
        topCountries
    }
}
