import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    Download,
    Plane,
    MapPin,
    Route,
    BarChart3,
    FileSpreadsheet,
    File
} from 'lucide-react'

type ReportType = 'flight' | 'airport' | 'route' | 'summary'

interface ReportOption {
    type: ReportType
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
}

const reportOptions: ReportOption[] = [
    { type: 'flight', title: 'Flight Report', description: 'Individual flight performance and delay analysis', icon: Plane },
    { type: 'airport', title: 'Airport Report', description: 'Airport statistics, OTP rates, and incidents', icon: MapPin },
    { type: 'route', title: 'Route Report', description: 'Route reliability and historical performance', icon: Route },
    { type: 'summary', title: 'Summary Report', description: 'Full system overview with all metrics', icon: BarChart3 },
]

const recentReports = [
    { name: 'AAL123 Flight Report', type: 'flight', date: '2026-01-06', format: 'PDF' },
    { name: 'JFK Airport Analysis', type: 'airport', date: '2026-01-05', format: 'PDF' },
    { name: 'System Summary - Weekly', type: 'summary', date: '2026-01-04', format: 'CSV' },
    { name: 'LAX-ORD Route Performance', type: 'route', date: '2026-01-03', format: 'XLSX' },
]

export default function Reports() {
    const [selectedType, setSelectedType] = useState<ReportType | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateReport = async (format: 'pdf' | 'csv' | 'xlsx') => {
        setIsGenerating(true)
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsGenerating(false)
        // In real implementation, this would call the API and trigger download
        alert(`${format.toUpperCase()} report generated! Download would start automatically.`)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-roboto-condensed text-2xl font-bold">Reports</h1>
                <p className="text-aviation-muted text-sm mt-1">
                    Generate and export aviation performance reports
                </p>
            </div>

            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportOptions.map((option, index) => {
                    const Icon = option.icon
                    const isSelected = selectedType === option.type
                    return (
                        <motion.button
                            key={option.type}
                            className={`card p-4 text-left transition-all ${isSelected
                                    ? 'border-aviation-red glow-red'
                                    : 'hover:border-aviation-border'
                                }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedType(option.type)}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isSelected ? 'bg-aviation-red' : 'bg-aviation-darker border border-aviation-border'
                                }`}>
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-aviation-red'}`} />
                            </div>
                            <h3 className="font-roboto-condensed font-bold text-white">{option.title}</h3>
                            <p className="text-sm text-aviation-muted mt-1">{option.description}</p>
                        </motion.button>
                    )
                })}
            </div>

            {/* Export Options */}
            {selectedType && (
                <motion.div
                    className="card p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-roboto-condensed text-lg font-bold">
                                Generate {reportOptions.find(o => o.type === selectedType)?.title}
                            </h2>
                            <p className="text-sm text-aviation-muted mt-1">
                                Choose an export format below
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.button
                            className="flex items-center gap-4 p-4 bg-aviation-darker rounded-xl border border-aviation-border hover:border-aviation-red transition-all group"
                            onClick={() => handleGenerateReport('pdf')}
                            disabled={isGenerating}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                                <FileText className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-white group-hover:text-aviation-red transition-colors">PDF Document</p>
                                <p className="text-sm text-aviation-muted">Formatted report</p>
                            </div>
                            <Download className="w-5 h-5 text-aviation-muted ml-auto group-hover:text-aviation-red transition-colors" />
                        </motion.button>

                        <motion.button
                            className="flex items-center gap-4 p-4 bg-aviation-darker rounded-xl border border-aviation-border hover:border-aviation-red transition-all group"
                            onClick={() => handleGenerateReport('csv')}
                            disabled={isGenerating}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                                <File className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-white group-hover:text-aviation-red transition-colors">CSV File</p>
                                <p className="text-sm text-aviation-muted">Raw data export</p>
                            </div>
                            <Download className="w-5 h-5 text-aviation-muted ml-auto group-hover:text-aviation-red transition-colors" />
                        </motion.button>

                        <motion.button
                            className="flex items-center gap-4 p-4 bg-aviation-darker rounded-xl border border-aviation-border hover:border-aviation-red transition-all group"
                            onClick={() => handleGenerateReport('xlsx')}
                            disabled={isGenerating}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-white group-hover:text-aviation-red transition-colors">Excel File</p>
                                <p className="text-sm text-aviation-muted">Spreadsheet format</p>
                            </div>
                            <Download className="w-5 h-5 text-aviation-muted ml-auto group-hover:text-aviation-red transition-colors" />
                        </motion.button>
                    </div>

                    {isGenerating && (
                        <div className="mt-6 flex items-center justify-center gap-3 py-4">
                            <div className="w-5 h-5 border-2 border-aviation-red border-t-transparent rounded-full animate-spin" />
                            <span className="text-aviation-muted">Generating report...</span>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Recent Reports */}
            <motion.div
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="p-4 border-b border-aviation-border">
                    <h2 className="font-roboto-condensed text-lg font-bold">Recent Reports</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-aviation-border">
                                <th className="table-header text-left p-4">Report Name</th>
                                <th className="table-header text-left p-4">Type</th>
                                <th className="table-header text-left p-4">Date</th>
                                <th className="table-header text-left p-4">Format</th>
                                <th className="table-header text-right p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReports.map((report, i) => (
                                <motion.tr
                                    key={i}
                                    className="border-b border-aviation-border/50 hover:bg-aviation-darker transition-colors"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-aviation-red" />
                                            <span className="text-white">{report.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-aviation-darker rounded-lg text-xs text-aviation-muted border border-aviation-border">
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-jetbrains text-aviation-muted text-sm">{report.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${report.format === 'PDF' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                report.format === 'CSV' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {report.format}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 ml-auto">
                                            <Download className="w-3 h-3" />
                                            Download
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
