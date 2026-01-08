import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface GlobePoint {
    lat: number
    lng: number
    label?: string
    type: 'airport' | 'flight'
    data?: any
}

interface Globe3DProps {
    airports: GlobePoint[]
    flights: GlobePoint[]
    onAirportClick?: (airport: GlobePoint) => void
    onFlightClick?: (flight: GlobePoint) => void
}

// Convert lat/lng to 3D coordinates
function latLngToVector3(lat: number, lng: number, radius: number = 2): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)

    return new THREE.Vector3(x, y, z)
}

// Create latitude and longitude grid lines only (no distorted continents)
function createGridLines(radius: number): THREE.BufferGeometry {
    const points: number[] = []

    // Latitude lines (horizontal circles)
    const latitudes = [-60, -30, 0, 30, 60]
    latitudes.forEach(lat => {
        for (let lng = -180; lng < 180; lng += 5) {
            const p1 = latLngToVector3(lat, lng, radius)
            const p2 = latLngToVector3(lat, lng + 5, radius)
            points.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
        }
    })

    // Longitude lines (vertical great circles)
    const longitudes = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180]
    longitudes.forEach(lng => {
        for (let lat = -80; lat < 80; lat += 5) {
            const p1 = latLngToVector3(lat, lng, radius)
            const p2 = latLngToVector3(lat + 5, lng, radius)
            points.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
        }
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    return geometry
}

export default function Globe3D({ airports, flights }: Globe3DProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const globeRef = useRef<THREE.Group | null>(null)
    const animationRef = useRef<number>(0)
    const mouseRef = useRef({ x: 0, y: 0, isDown: false })

    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const width = container.clientWidth
        const height = container.clientHeight

        // Check WebGL support
        try {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
            if (!gl) {
                setError('WebGL is not supported in your browser')
                return
            }
        } catch (e) {
            setError('WebGL initialization failed')
            return
        }

        try {
            // Scene
            const scene = new THREE.Scene()
            sceneRef.current = scene

            // Camera
            const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
            camera.position.z = 5
            cameraRef.current = camera

            // Renderer
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: 'default'
            })
            renderer.setSize(width, height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            renderer.setClearColor(0x050510, 1)
            container.appendChild(renderer.domElement)
            rendererRef.current = renderer

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
            scene.add(ambientLight)

            const sunLight = new THREE.DirectionalLight(0xffffff, 1.0)
            sunLight.position.set(5, 3, 5)
            scene.add(sunLight)

            const redAccent = new THREE.PointLight(0xdc2626, 0.3)
            redAccent.position.set(-5, -3, -5)
            scene.add(redAccent)

            // Stars background
            const starsGeometry = new THREE.BufferGeometry()
            const starPositions = new Float32Array(3000 * 3)
            for (let i = 0; i < 3000; i++) {
                starPositions[i * 3] = (Math.random() - 0.5) * 300
                starPositions[i * 3 + 1] = (Math.random() - 0.5) * 300
                starPositions[i * 3 + 2] = (Math.random() - 0.5) * 300
            }
            starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
            const starsMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.5,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.8
            })
            const stars = new THREE.Points(starsGeometry, starsMaterial)
            scene.add(stars)

            // Globe group
            const globeGroup = new THREE.Group()
            globeRef.current = globeGroup
            scene.add(globeGroup)

            // Load Earth texture
            const textureLoader = new THREE.TextureLoader()

            // Earth sphere with texture
            const earthGeometry = new THREE.SphereGeometry(2, 64, 64)

            // Try to load a world map texture, fallback to styled sphere
            const earthMaterial = new THREE.MeshPhongMaterial({
                color: 0x1a3a5c,
                shininess: 15,
                specular: 0x222244,
            })

            // Create Earth mesh
            const earth = new THREE.Mesh(earthGeometry, earthMaterial)
            globeGroup.add(earth)

            // Try loading NASA Blue Marble texture
            textureLoader.load(
                'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
                (texture) => {
                    earth.material = new THREE.MeshPhongMaterial({
                        map: texture,
                        shininess: 10,
                        specular: 0x222222,
                    })
                    earth.material.needsUpdate = true
                },
                undefined,
                () => {
                    // Fallback: try another texture source
                    textureLoader.load(
                        'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg',
                        (texture) => {
                            earth.material = new THREE.MeshPhongMaterial({
                                map: texture,
                                shininess: 10,
                                specular: 0x222222,
                            })
                            earth.material.needsUpdate = true
                        },
                        undefined,
                        () => {
                            console.log('Using fallback solid color for Earth')
                        }
                    )
                }
            )

            // Grid lines
            const gridGeometry = createGridLines(2.005)
            const gridMaterial = new THREE.LineBasicMaterial({
                color: 0x40a0ff,
                transparent: true,
                opacity: 0.15,
            })
            const grid = new THREE.LineSegments(gridGeometry, gridMaterial)
            globeGroup.add(grid)

            // Atmosphere glow
            const atmosphereGeometry = new THREE.SphereGeometry(2.12, 64, 64)
            const atmosphereMaterial = new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec3 vNormal;
                    void main() {
                        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 0.5;
                    }
                `,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true
            })
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
            globeGroup.add(atmosphere)

            // Airport markers - glowing red spheres with pulse
            airports.forEach(airport => {
                const pos = latLngToVector3(airport.lat, airport.lng, 2.03)

                // Outer glow
                const glowGeometry = new THREE.SphereGeometry(0.04, 16, 16)
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff4444,
                    transparent: true,
                    opacity: 0.3
                })
                const glow = new THREE.Mesh(glowGeometry, glowMaterial)
                glow.position.copy(pos)
                globeGroup.add(glow)

                // Core marker
                const markerGeometry = new THREE.SphereGeometry(0.025, 16, 16)
                const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xdc2626 })
                const marker = new THREE.Mesh(markerGeometry, markerMaterial)
                marker.position.copy(pos)
                marker.userData = { type: 'airport', data: airport }
                globeGroup.add(marker)
            })

            // Flight markers - green dots
            const flightMaterial = new THREE.MeshBasicMaterial({ color: 0x22c55e })
            const maxFlights = Math.min(flights.length, 300)
            for (let i = 0; i < maxFlights; i++) {
                const flight = flights[i]
                const pos = latLngToVector3(flight.lat, flight.lng, 2.05)
                const markerGeometry = new THREE.SphereGeometry(0.012, 8, 8)
                const marker = new THREE.Mesh(markerGeometry, flightMaterial)
                marker.position.copy(pos)
                marker.userData = { type: 'flight', data: flight }
                globeGroup.add(marker)
            }

            setIsLoading(false)

            // Mouse controls
            const onMouseDown = (e: MouseEvent) => {
                mouseRef.current.isDown = true
                mouseRef.current.x = e.clientX
                mouseRef.current.y = e.clientY
            }

            const onMouseUp = () => {
                mouseRef.current.isDown = false
            }

            const onMouseMove = (e: MouseEvent) => {
                if (!mouseRef.current.isDown || !globeRef.current) return
                const deltaX = e.clientX - mouseRef.current.x
                const deltaY = e.clientY - mouseRef.current.y
                globeRef.current.rotation.y += deltaX * 0.005
                globeRef.current.rotation.x += deltaY * 0.003
                globeRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, globeRef.current.rotation.x))
                mouseRef.current.x = e.clientX
                mouseRef.current.y = e.clientY
            }

            const onWheel = (e: WheelEvent) => {
                e.preventDefault()
                if (!cameraRef.current) return
                cameraRef.current.position.z += e.deltaY * 0.005
                cameraRef.current.position.z = Math.max(2.8, Math.min(8, cameraRef.current.position.z))
            }

            // Touch controls
            const onTouchStart = (e: TouchEvent) => {
                if (e.touches.length === 1) {
                    mouseRef.current.isDown = true
                    mouseRef.current.x = e.touches[0].clientX
                    mouseRef.current.y = e.touches[0].clientY
                }
            }

            const onTouchEnd = () => {
                mouseRef.current.isDown = false
            }

            const onTouchMove = (e: TouchEvent) => {
                if (!mouseRef.current.isDown || !globeRef.current || e.touches.length !== 1) return
                const deltaX = e.touches[0].clientX - mouseRef.current.x
                const deltaY = e.touches[0].clientY - mouseRef.current.y
                globeRef.current.rotation.y += deltaX * 0.005
                globeRef.current.rotation.x += deltaY * 0.003
                globeRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, globeRef.current.rotation.x))
                mouseRef.current.x = e.touches[0].clientX
                mouseRef.current.y = e.touches[0].clientY
            }

            renderer.domElement.addEventListener('mousedown', onMouseDown)
            renderer.domElement.addEventListener('mouseup', onMouseUp)
            renderer.domElement.addEventListener('mouseleave', onMouseUp)
            renderer.domElement.addEventListener('mousemove', onMouseMove)
            renderer.domElement.addEventListener('wheel', onWheel, { passive: false })
            renderer.domElement.addEventListener('touchstart', onTouchStart)
            renderer.domElement.addEventListener('touchend', onTouchEnd)
            renderer.domElement.addEventListener('touchmove', onTouchMove)

            // Animation loop
            let time = 0
            const animate = () => {
                animationRef.current = requestAnimationFrame(animate)
                time += 0.016

                // Auto-rotate when not dragging
                if (!mouseRef.current.isDown && globeRef.current) {
                    globeRef.current.rotation.y += 0.0015
                }

                // Pulse effect for markers
                globeGroup.children.forEach(child => {
                    if (child instanceof THREE.Mesh) {
                        const userData = child.userData as any
                        if (userData?.type === 'flight') {
                            const scale = 1 + Math.sin(time * 4) * 0.15
                            child.scale.setScalar(scale)
                        }
                    }
                })

                renderer.render(scene, camera)
            }
            animate()

            // Handle resize
            const handleResize = () => {
                if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
                const newWidth = containerRef.current.clientWidth
                const newHeight = containerRef.current.clientHeight
                cameraRef.current.aspect = newWidth / newHeight
                cameraRef.current.updateProjectionMatrix()
                rendererRef.current.setSize(newWidth, newHeight)
            }
            window.addEventListener('resize', handleResize)

            // Cleanup
            return () => {
                cancelAnimationFrame(animationRef.current)
                window.removeEventListener('resize', handleResize)
                renderer.domElement.removeEventListener('mousedown', onMouseDown)
                renderer.domElement.removeEventListener('mouseup', onMouseUp)
                renderer.domElement.removeEventListener('mouseleave', onMouseUp)
                renderer.domElement.removeEventListener('mousemove', onMouseMove)
                renderer.domElement.removeEventListener('wheel', onWheel)
                renderer.domElement.removeEventListener('touchstart', onTouchStart)
                renderer.domElement.removeEventListener('touchend', onTouchEnd)
                renderer.domElement.removeEventListener('touchmove', onTouchMove)
                renderer.dispose()
                if (container.contains(renderer.domElement)) {
                    container.removeChild(renderer.domElement)
                }
            }
        } catch (err) {
            console.error('Globe3D error:', err)
            setError('Failed to initialize 3D visualization')
            setIsLoading(false)
        }
    }, [airports, flights])

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-aviation-darker">
                <div className="text-center p-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-aviation-red/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-aviation-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-aviation-muted text-sm">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full relative bg-[#050510]">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#050510] z-20">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-aviation-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-aviation-muted text-xs">Loading 3D Globe...</p>
                    </div>
                </div>
            )}

            <div ref={containerRef} className="w-full h-full" />

            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex items-center gap-4 text-xs z-10 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" style={{ boxShadow: '0 0 8px #dc2626' }} />
                    <span className="text-white/80">Airports ({airports.length})</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" style={{ boxShadow: '0 0 8px #22c55e' }} />
                    <span className="text-white/80">Flights ({Math.min(flights.length, 300)})</span>
                </div>
            </div>

            {/* Controls hint */}
            <div className="absolute top-3 right-3 text-[10px] text-white/60 z-10 bg-black/50 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
                🖱️ Drag to rotate • Scroll to zoom
            </div>
        </div>
    )
}
