import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

interface AnimatedFlightPathProps {
    origin: { lat: number; lng: number }
    destination: { lat: number; lng: number }
    color?: string
    animationDuration?: number
}

export default function AnimatedFlightPath({
    origin,
    destination,
    color = '#dc2626',
    animationDuration = 4000,
}: AnimatedFlightPathProps) {
    const map = useMap()
    const pathRef = useRef<L.Polyline | null>(null)
    const planeRef = useRef<L.Marker | null>(null)
    const animationRef = useRef<number>(0)

    useEffect(() => {
        if (!map) return

        // Generate curved path points
        const getCurvedPath = (start: { lat: number; lng: number }, end: { lat: number; lng: number }): L.LatLng[] => {
            const points: L.LatLng[] = []
            const numPoints = 50

            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints

                // Linear interpolation
                const lat = start.lat + (end.lat - start.lat) * t
                const lng = start.lng + (end.lng - start.lng) * t

                // Add arc curve (higher in the middle)
                const curve = Math.sin(t * Math.PI) * 0.08 * Math.abs(end.lng - start.lng)

                points.push(L.latLng(lat + curve * 0.2, lng))
            }

            return points
        }

        const pathPoints = getCurvedPath(origin, destination)

        // Create the path line (starts empty, will be drawn progressively)
        pathRef.current = L.polyline([], {
            color: color,
            weight: 2,
            opacity: 0.7,
            dashArray: '8, 4',
        }).addTo(map)

        // Create plane marker
        const planeIcon = L.divIcon({
            className: 'animated-plane',
            html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="${color}" style="filter: drop-shadow(0 0 3px ${color});">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        })

        planeRef.current = L.marker(pathPoints[0], { icon: planeIcon }).addTo(map)

        // Animation
        let currentIndex = 0
        let startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = (elapsed % animationDuration) / animationDuration
            const targetIndex = Math.floor(progress * pathPoints.length)

            if (targetIndex !== currentIndex && pathRef.current && planeRef.current) {
                // Update path
                const visiblePath = pathPoints.slice(0, targetIndex + 1)
                pathRef.current.setLatLngs(visiblePath)

                // Update plane position
                if (targetIndex < pathPoints.length) {
                    planeRef.current.setLatLng(pathPoints[targetIndex])

                    // Calculate rotation
                    if (targetIndex > 0) {
                        const prev = pathPoints[targetIndex - 1]
                        const curr = pathPoints[targetIndex]
                        const angle = Math.atan2(
                            curr.lng - prev.lng,
                            curr.lat - prev.lat
                        ) * (180 / Math.PI)

                        const icon = planeRef.current.getElement()
                        if (icon) {
                            icon.style.transform = `rotate(${90 - angle}deg)`
                        }
                    }
                }

                currentIndex = targetIndex
            }

            // Reset at end of animation
            if (progress >= 0.99) {
                currentIndex = 0
                if (pathRef.current) pathRef.current.setLatLngs([])
                if (planeRef.current) planeRef.current.setLatLng(pathPoints[0])
                startTime = Date.now()
            }

            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(animationRef.current)
            if (pathRef.current && map.hasLayer(pathRef.current)) {
                map.removeLayer(pathRef.current)
            }
            if (planeRef.current && map.hasLayer(planeRef.current)) {
                map.removeLayer(planeRef.current)
            }
        }
    }, [map, origin, destination, color, animationDuration])

    return null
}

// Multiple flight paths component
interface FlightRoute {
    origin: { lat: number; lng: number }
    destination: { lat: number; lng: number }
    color?: string
}

interface AnimatedFlightPathsProps {
    routes: FlightRoute[]
}

export function AnimatedFlightPaths({ routes }: AnimatedFlightPathsProps) {
    return (
        <>
            {routes.map((route, index) => (
                <AnimatedFlightPath
                    key={`route-${index}`}
                    origin={route.origin}
                    destination={route.destination}
                    color={route.color || '#dc2626'}
                    animationDuration={4000 + index * 800}
                />
            ))}
        </>
    )
}
