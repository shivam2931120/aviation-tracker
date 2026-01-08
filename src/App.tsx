import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Airports from './pages/Airports'
import AirportDetail from './pages/AirportDetail'
import RoutesPage from './pages/Routes'
import FlightDetails from './pages/FlightDetails'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import AircraftSpotting from './pages/AircraftSpotting'
import FlightMilesTracker from './pages/FlightMilesTracker'
import AirTrafficCongestion from './pages/AirTrafficCongestion'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="airports" element={<Airports />} />
                <Route path="airport/:iata" element={<AirportDetail />} />
                <Route path="routes" element={<RoutesPage />} />
                <Route path="flight/:id" element={<FlightDetails />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="congestion" element={<AirTrafficCongestion />} />
                <Route path="miles" element={<FlightMilesTracker />} />
                <Route path="spotting" element={<AircraftSpotting />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    )
}

export default App
