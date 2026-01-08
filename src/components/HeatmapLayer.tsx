import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

// Import leaflet.heat - it extends L directly
import 'leaflet.heat'

// Extend Leaflet types
declare module 'leaflet' {
    function heatLayer(
        latlngs: Array<[number, number] | [number, number, number]>,
        options?: {
            minOpacity?: number
            maxZoom?: number
            max?: number
            radius?: number
            blur?: number
            gradient?: { [key: number]: string }
        }
    ): L.Layer
}

interface HeatmapLayerProps {
    points: Array<[number, number, number]> // [lat, lng, intensity]
    options?: {
        radius?: number
        blur?: number
        maxZoom?: number
        max?: number
        gradient?: { [key: number]: string }
    }
}

export default function HeatmapLayer({ points, options = {} }: HeatmapLayerProps) {
    const map = useMap()

    useEffect(() => {
        if (!map || !points || points.length === 0) {
            console.log('HeatmapLayer: No map or points available')
            return
        }

        // Check if L.heatLayer exists
        if (typeof L.heatLayer !== 'function') {
            console.error('HeatmapLayer: L.heatLayer is not available. leaflet.heat may not be loaded correctly.')
            return
        }

        console.log(`HeatmapLayer: Creating heatmap with ${points.length} points`)

        // Default options optimized for aviation theme
        const defaultOptions = {
            radius: 25,
            blur: 20,
            maxZoom: 10,
            max: 1.0,
            minOpacity: 0.3,
            gradient: {
                0.0: '#000000',
                0.2: '#1a0a0a',
                0.4: '#5c1a1a',
                0.6: '#991b1b',
                0.8: '#dc2626',
                1.0: '#f87171'
            }
        }

        const heatLayer = L.heatLayer(points, { ...defaultOptions, ...options })
        heatLayer.addTo(map)

        console.log('HeatmapLayer: Added to map successfully')

        return () => {
            if (map.hasLayer(heatLayer)) {
                map.removeLayer(heatLayer)
                console.log('HeatmapLayer: Removed from map')
            }
        }
    }, [map, points, options])

    return null
}
