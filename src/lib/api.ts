// API base URL for development
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// Types
export interface Flight {
    id: string;
    icao24: string;
    callsign: string;
    airlineIata: string;
    airlineName?: string;
    departureIata: string;
    departureCity?: string;
    departureName?: string;
    arrivalIata: string;
    arrivalCity?: string;
    arrivalName?: string;
    scheduledDeparture: string;
    actualDeparture: string | null;
    scheduledArrival: string;
    actualArrival: string | null;
    delayMinutes: number | null;
    altitude: number | null;
    velocity: number | null;
    trueTrack: number | null;
    reliabilityScore: number;
    status: string;
    turnaroundEstimate: number | null;
    coordinates: {
        lat: number;
        lng: number;
        origin?: { lat: number; lng: number };
        destination?: { lat: number; lng: number };
    };
    createdAt: string;
}

export interface Airport {
    iata: string;
    icao: string;
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    otpPercent: number;
    avgDelay: number;
    totalFlights: number;
    riskScore: number;
    wikiLink: string;
    clusterTag: string | null;
    timezone: string | null;
    activeIncidents?: number;
}

export interface Route {
    id: number;
    originIata: string;
    originCity?: string;
    originName?: string;
    destIata: string;
    destCity?: string;
    destName?: string;
    airlineIata: string;
    airlineName: string;
    otpPercent: number;
    avgDelay: number;
    weatherRisk: number;
    peakHourFactor: number;
    reliabilityIndex: number;
}

export interface Airline {
    iata: string;
    icao: string;
    name: string;
    country: string;
    otpPercent: number;
    avgDelay: number;
    fleetSize: number | null;
    logoUrl: string | null;
}

export interface Incident {
    id: number;
    airportIata: string;
    date: string;
    type: string;
    impactLevel: number;
    description: string;
    resolved: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface PredictionResult {
    reliabilityScore: number;
    predictedDelayMinutes: number;
    confidence: number;
    factors: {
        name: string;
        value: number;
        impact: 'positive' | 'negative' | 'neutral';
        description: string;
    }[];
    explanation: string;
}

export interface AnalyticsData {
    airlines: Airline[];
    airports: Airport[];
    delayedRoutes: Route[];
    reliableRoutes: Route[];
    flightStats: Record<string, number>;
    delayDistribution: {
        onTime: number;
        minor: number;
        moderate: number;
        severe: number;
    };
    peakHourAnalysis: {
        hour: string;
        count: number;
        totalDelay: number;
        avgDelay: number;
    }[];
    activeIncidents: Incident[];
}

// API Functions
export const api = {
    // Flights
    getFlights: (params?: { status?: string; airline?: string; limit?: number; offset?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set('status', params.status);
        if (params?.airline) searchParams.set('airline', params.airline);
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));
        return fetchAPI<PaginatedResponse<Flight>>(`/api/flights?${searchParams}`);
    },

    getFlight: (id: string) => fetchAPI<{
        flight: Flight;
        airline: Airline | null;
        departure: Airport | null;
        arrival: Airport | null;
        route: Route | null;
        history: Flight[];
        explanation: string;
    }>(`/api/flight/${id}`),

    // Airports
    getAirports: (params?: { search?: string; limit?: number; offset?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.set('search', params.search);
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));
        return fetchAPI<PaginatedResponse<Airport>>(`/api/airports?${searchParams}`);
    },

    // Routes
    getRoutes: (params?: { airline?: string; origin?: string; destination?: string; sortBy?: string; limit?: number; offset?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.airline) searchParams.set('airline', params.airline);
        if (params?.origin) searchParams.set('origin', params.origin);
        if (params?.destination) searchParams.set('destination', params.destination);
        if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));
        return fetchAPI<PaginatedResponse<Route>>(`/api/routes?${searchParams}`);
    },

    // Airlines
    getAirlines: () => fetchAPI<PaginatedResponse<Airline>>('/api/airlines'),

    // Analytics
    getAnalytics: () => fetchAPI<AnalyticsData>('/api/analytics'),

    // Predict delay
    predictDelay: (data: { originIata: string; destIata: string; airlineIata: string; scheduledDeparture?: string; turnaroundMinutes?: number }) =>
        fetchAPI<PredictionResult>('/api/predict_delay', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // Reports
    getReport: (type: 'flight' | 'airport' | 'route' | 'summary', id?: string, format?: 'json' | 'csv') => {
        const searchParams = new URLSearchParams({ type });
        if (id) searchParams.set('id', id);
        if (format) searchParams.set('format', format);
        return fetchAPI(`/api/reports?${searchParams}`);
    },
};

export default api;
