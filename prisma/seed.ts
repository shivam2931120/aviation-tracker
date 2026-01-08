import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Realistic airline data
const airlines = [
    { iata: 'AA', icao: 'AAL', name: 'American Airlines', country: 'USA', otpPercent: 78.5, avgDelay: 12.3, fleetSize: 950, logoUrl: null },
    { iata: 'UA', icao: 'UAL', name: 'United Airlines', country: 'USA', otpPercent: 76.2, avgDelay: 14.1, fleetSize: 850, logoUrl: null },
    { iata: 'DL', icao: 'DAL', name: 'Delta Air Lines', country: 'USA', otpPercent: 82.1, avgDelay: 9.8, fleetSize: 900, logoUrl: null },
    { iata: 'LH', icao: 'DLH', name: 'Lufthansa', country: 'Germany', otpPercent: 79.8, avgDelay: 11.2, fleetSize: 350, logoUrl: null },
    { iata: 'BA', icao: 'BAW', name: 'British Airways', country: 'UK', otpPercent: 77.4, avgDelay: 13.5, fleetSize: 280, logoUrl: null },
];

// Major airports with realistic data
const airports = [
    { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', latitude: 40.6413, longitude: -73.7781, otpPercent: 74.2, avgDelay: 18.5, totalFlights: 1250, riskScore: 35.5, wikiLink: 'https://en.wikipedia.org/wiki/John_F._Kennedy_International_Airport', clusterTag: 'hub', timezone: 'America/New_York' },
    { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', latitude: 33.9425, longitude: -118.4081, otpPercent: 76.8, avgDelay: 15.2, totalFlights: 1450, riskScore: 28.3, wikiLink: 'https://en.wikipedia.org/wiki/Los_Angeles_International_Airport', clusterTag: 'hub', timezone: 'America/Los_Angeles' },
    { iata: 'ORD', icao: 'KORD', name: "O'Hare International Airport", city: 'Chicago', country: 'USA', latitude: 41.9742, longitude: -87.9073, otpPercent: 71.5, avgDelay: 22.1, totalFlights: 1380, riskScore: 42.8, wikiLink: 'https://en.wikipedia.org/wiki/O%27Hare_International_Airport', clusterTag: 'hub', timezone: 'America/Chicago' },
    { iata: 'LHR', icao: 'EGLL', name: 'Heathrow Airport', city: 'London', country: 'UK', latitude: 51.4700, longitude: -0.4543, otpPercent: 78.3, avgDelay: 14.8, totalFlights: 1320, riskScore: 31.2, wikiLink: 'https://en.wikipedia.org/wiki/Heathrow_Airport', clusterTag: 'hub', timezone: 'Europe/London' },
    { iata: 'FRA', icao: 'EDDF', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', latitude: 50.0379, longitude: 8.5622, otpPercent: 80.1, avgDelay: 12.5, totalFlights: 1180, riskScore: 25.6, wikiLink: 'https://en.wikipedia.org/wiki/Frankfurt_Airport', clusterTag: 'hub', timezone: 'Europe/Berlin' },
    { iata: 'DFW', icao: 'KDFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA', latitude: 32.8998, longitude: -97.0403, otpPercent: 79.5, avgDelay: 13.2, totalFlights: 1420, riskScore: 27.4, wikiLink: 'https://en.wikipedia.org/wiki/Dallas/Fort_Worth_International_Airport', clusterTag: 'hub', timezone: 'America/Chicago' },
    { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA', latitude: 33.6407, longitude: -84.4277, otpPercent: 77.8, avgDelay: 14.5, totalFlights: 2500, riskScore: 32.1, wikiLink: 'https://en.wikipedia.org/wiki/Hartsfield%E2%80%93Jackson_Atlanta_International_Airport', clusterTag: 'mega-hub', timezone: 'America/New_York' },
    { iata: 'DEN', icao: 'KDEN', name: 'Denver International Airport', city: 'Denver', country: 'USA', latitude: 39.8561, longitude: -104.6737, otpPercent: 75.2, avgDelay: 16.8, totalFlights: 1650, riskScore: 38.2, wikiLink: 'https://en.wikipedia.org/wiki/Denver_International_Airport', clusterTag: 'hub', timezone: 'America/Denver' },
    { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479, otpPercent: 76.5, avgDelay: 15.8, totalFlights: 1280, riskScore: 33.5, wikiLink: 'https://en.wikipedia.org/wiki/Charles_de_Gaulle_Airport', clusterTag: 'hub', timezone: 'Europe/Paris' },
    { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA', latitude: 37.6213, longitude: -122.3790, otpPercent: 73.8, avgDelay: 19.2, totalFlights: 1150, riskScore: 41.5, wikiLink: 'https://en.wikipedia.org/wiki/San_Francisco_International_Airport', clusterTag: 'hub', timezone: 'America/Los_Angeles' },
];

// Routes with reliability data
const routes = [
    { originIata: 'JFK', destIata: 'LAX', airlineIata: 'AA', airlineName: 'American Airlines', otpPercent: 75.5, avgDelay: 16.2, weatherRisk: 0.25, peakHourFactor: 1.3, reliabilityIndex: 72.8 },
    { originIata: 'JFK', destIata: 'LHR', airlineIata: 'BA', airlineName: 'British Airways', otpPercent: 78.2, avgDelay: 14.5, weatherRisk: 0.35, peakHourFactor: 1.1, reliabilityIndex: 74.5 },
    { originIata: 'LAX', destIata: 'ORD', airlineIata: 'UA', airlineName: 'United Airlines', otpPercent: 72.8, avgDelay: 18.5, weatherRisk: 0.30, peakHourFactor: 1.4, reliabilityIndex: 68.2 },
    { originIata: 'ORD', destIata: 'DFW', airlineIata: 'AA', airlineName: 'American Airlines', otpPercent: 74.1, avgDelay: 17.2, weatherRisk: 0.28, peakHourFactor: 1.2, reliabilityIndex: 70.5 },
    { originIata: 'ATL', destIata: 'JFK', airlineIata: 'DL', airlineName: 'Delta Air Lines', otpPercent: 81.5, avgDelay: 10.8, weatherRisk: 0.22, peakHourFactor: 1.1, reliabilityIndex: 79.2 },
    { originIata: 'FRA', destIata: 'JFK', airlineIata: 'LH', airlineName: 'Lufthansa', otpPercent: 80.2, avgDelay: 12.1, weatherRisk: 0.32, peakHourFactor: 1.0, reliabilityIndex: 77.8 },
    { originIata: 'LHR', destIata: 'FRA', airlineIata: 'BA', airlineName: 'British Airways', otpPercent: 82.5, avgDelay: 9.5, weatherRisk: 0.20, peakHourFactor: 0.9, reliabilityIndex: 81.2 },
    { originIata: 'DEN', destIata: 'LAX', airlineIata: 'UA', airlineName: 'United Airlines', otpPercent: 76.8, avgDelay: 14.8, weatherRisk: 0.35, peakHourFactor: 1.2, reliabilityIndex: 72.5 },
    { originIata: 'SFO', destIata: 'JFK', airlineIata: 'DL', airlineName: 'Delta Air Lines', otpPercent: 73.2, avgDelay: 19.5, weatherRisk: 0.40, peakHourFactor: 1.3, reliabilityIndex: 67.8 },
    { originIata: 'CDG', destIata: 'LHR', airlineIata: 'BA', airlineName: 'British Airways', otpPercent: 84.1, avgDelay: 8.2, weatherRisk: 0.18, peakHourFactor: 0.8, reliabilityIndex: 83.5 },
    { originIata: 'ATL', destIata: 'LAX', airlineIata: 'DL', airlineName: 'Delta Air Lines', otpPercent: 79.5, avgDelay: 12.5, weatherRisk: 0.25, peakHourFactor: 1.1, reliabilityIndex: 76.8 },
    { originIata: 'ORD', destIata: 'LHR', airlineIata: 'AA', airlineName: 'American Airlines', otpPercent: 76.2, avgDelay: 15.8, weatherRisk: 0.38, peakHourFactor: 1.2, reliabilityIndex: 71.5 },
    { originIata: 'DFW', destIata: 'FRA', airlineIata: 'LH', airlineName: 'Lufthansa', otpPercent: 78.8, avgDelay: 13.2, weatherRisk: 0.30, peakHourFactor: 1.0, reliabilityIndex: 75.2 },
    { originIata: 'SFO', destIata: 'CDG', airlineIata: 'UA', airlineName: 'United Airlines', otpPercent: 74.5, avgDelay: 17.5, weatherRisk: 0.42, peakHourFactor: 1.1, reliabilityIndex: 69.8 },
    { originIata: 'JFK', destIata: 'CDG', airlineIata: 'DL', airlineName: 'Delta Air Lines', otpPercent: 77.8, avgDelay: 14.2, weatherRisk: 0.28, peakHourFactor: 1.0, reliabilityIndex: 74.2 },
    { originIata: 'LAX', destIata: 'ATL', airlineIata: 'AA', airlineName: 'American Airlines', otpPercent: 78.2, avgDelay: 13.8, weatherRisk: 0.22, peakHourFactor: 1.2, reliabilityIndex: 75.5 },
    { originIata: 'DEN', destIata: 'ORD', airlineIata: 'UA', airlineName: 'United Airlines', otpPercent: 71.5, avgDelay: 20.2, weatherRisk: 0.45, peakHourFactor: 1.4, reliabilityIndex: 65.8 },
    { originIata: 'LHR', destIata: 'JFK', airlineIata: 'BA', airlineName: 'British Airways', otpPercent: 79.5, avgDelay: 13.5, weatherRisk: 0.32, peakHourFactor: 1.1, reliabilityIndex: 75.8 },
    { originIata: 'FRA', destIata: 'CDG', airlineIata: 'LH', airlineName: 'Lufthansa', otpPercent: 85.2, avgDelay: 7.5, weatherRisk: 0.15, peakHourFactor: 0.8, reliabilityIndex: 84.8 },
    { originIata: 'ATL', destIata: 'DFW', airlineIata: 'DL', airlineName: 'Delta Air Lines', otpPercent: 80.8, avgDelay: 11.2, weatherRisk: 0.20, peakHourFactor: 1.0, reliabilityIndex: 78.5 },
];

// Sample incidents
const incidents = [
    { airportIata: 'JFK', date: new Date('2026-01-05T14:30:00Z'), type: 'WEATHER', impactLevel: 3, description: 'Heavy snowfall causing delays of 30-60 minutes', resolved: true },
    { airportIata: 'ORD', date: new Date('2026-01-04T08:15:00Z'), type: 'ATC', impactLevel: 2, description: 'Air traffic control staff shortage, minor delays', resolved: true },
    { airportIata: 'LAX', date: new Date('2026-01-06T16:45:00Z'), type: 'MECHANICAL', impactLevel: 4, description: 'Runway 25L temporarily closed for maintenance', resolved: false },
    { airportIata: 'LHR', date: new Date('2026-01-03T10:00:00Z'), type: 'SECURITY', impactLevel: 3, description: 'Security screening delays due to system update', resolved: true },
    { airportIata: 'DEN', date: new Date('2026-01-05T22:00:00Z'), type: 'WEATHER', impactLevel: 4, description: 'Thunderstorms in approach path, ground stop in effect', resolved: true },
];

// Sample flights (recent ones for the tracker)
const generateFlights = () => {
    const flights = [];
    const statuses = ['scheduled', 'active', 'landed', 'delayed'];
    const now = new Date();

    const flightData = [
        { icao24: 'a0b1c2', callsign: 'AAL123', airline: 'AA', from: 'JFK', to: 'LAX' },
        { icao24: 'b1c2d3', callsign: 'UAL456', airline: 'UA', from: 'LAX', to: 'ORD' },
        { icao24: 'c2d3e4', callsign: 'DAL789', airline: 'DL', from: 'ATL', to: 'JFK' },
        { icao24: 'd3e4f5', callsign: 'BAW101', airline: 'BA', from: 'LHR', to: 'JFK' },
        { icao24: 'e4f5g6', callsign: 'DLH202', airline: 'LH', from: 'FRA', to: 'JFK' },
        { icao24: 'f5g6h7', callsign: 'AAL303', airline: 'AA', from: 'DFW', to: 'LAX' },
        { icao24: 'g6h7i8', callsign: 'UAL404', airline: 'UA', from: 'DEN', to: 'SFO' },
        { icao24: 'h7i8j9', callsign: 'DAL505', airline: 'DL', from: 'ATL', to: 'CDG' },
        { icao24: 'i8j9k0', callsign: 'BAW606', airline: 'BA', from: 'LHR', to: 'FRA' },
        { icao24: 'j9k0l1', callsign: 'DLH707', airline: 'LH', from: 'FRA', to: 'CDG' },
    ];

    flightData.forEach((fd, index) => {
        const departureTime = new Date(now.getTime() - (index * 30 * 60 * 1000));
        const arrivalTime = new Date(departureTime.getTime() + (4 * 60 * 60 * 1000));
        const status = statuses[index % statuses.length];
        const delayMinutes = status === 'delayed' ? Math.floor(Math.random() * 60) + 15 : (Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0);

        // Generate coordinates based on origin airport
        const originAirport = airports.find(a => a.iata === fd.from);
        const destAirport = airports.find(a => a.iata === fd.to);

        const progress = status === 'landed' ? 1 : (status === 'active' ? Math.random() * 0.8 + 0.1 : 0);
        const currentLat = originAirport!.latitude + (destAirport!.latitude - originAirport!.latitude) * progress;
        const currentLng = originAirport!.longitude + (destAirport!.longitude - originAirport!.longitude) * progress;

        flights.push({
            icao24: fd.icao24,
            callsign: fd.callsign,
            airlineIata: fd.airline,
            departureIata: fd.from,
            arrivalIata: fd.to,
            scheduledDeparture: departureTime,
            actualDeparture: status !== 'scheduled' ? new Date(departureTime.getTime() + delayMinutes * 60 * 1000) : null,
            scheduledArrival: arrivalTime,
            actualArrival: status === 'landed' ? new Date(arrivalTime.getTime() + delayMinutes * 60 * 1000) : null,
            delayMinutes: delayMinutes > 0 ? delayMinutes : null,
            altitude: status === 'active' ? 35000 + Math.random() * 5000 : null,
            velocity: status === 'active' ? 450 + Math.random() * 100 : null,
            trueTrack: status === 'active' ? Math.random() * 360 : null,
            reliabilityScore: 70 + Math.random() * 25,
            status: status,
            turnaroundEstimate: 45 + Math.floor(Math.random() * 30),
            coordinates: {
                lat: currentLat,
                lng: currentLng,
                origin: { lat: originAirport!.latitude, lng: originAirport!.longitude },
                destination: { lat: destAirport!.latitude, lng: destAirport!.longitude },
            },
        });
    });

    return flights;
};

async function main() {
    console.log('🛫 Starting database seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.flight.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.route.deleteMany();
    await prisma.airport.deleteMany();
    await prisma.airline.deleteMany();

    // Seed airlines
    console.log('Seeding airlines...');
    for (const airline of airlines) {
        await prisma.airline.create({ data: airline });
    }
    console.log(`✅ Seeded ${airlines.length} airlines`);

    // Seed airports
    console.log('Seeding airports...');
    for (const airport of airports) {
        await prisma.airport.create({ data: airport });
    }
    console.log(`✅ Seeded ${airports.length} airports`);

    // Seed routes
    console.log('Seeding routes...');
    for (const route of routes) {
        await prisma.route.create({ data: route });
    }
    console.log(`✅ Seeded ${routes.length} routes`);

    // Seed incidents
    console.log('Seeding incidents...');
    for (const incident of incidents) {
        await prisma.incident.create({ data: incident });
    }
    console.log(`✅ Seeded ${incidents.length} incidents`);

    // Seed flights
    console.log('Seeding flights...');
    const flights = generateFlights();
    for (const flight of flights) {
        await prisma.flight.create({ data: flight });
    }
    console.log(`✅ Seeded ${flights.length} flights`);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
