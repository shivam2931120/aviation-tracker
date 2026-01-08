import { Outlet } from "react-router-dom"
import { useState } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-aviation-black flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Hidden on mobile, shown on lg+ */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50
                transform transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen w-full lg:w-auto">
                <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
