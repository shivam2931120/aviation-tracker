/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                aviation: {
                    black: '#000000',
                    dark: '#0a0a0a',
                    darker: '#050505',
                    red: '#dc2626',
                    'red-hover': '#b91c1c',
                    'red-light': '#ef4444',
                    'red-glow': 'rgba(220, 38, 38, 0.3)',
                    muted: '#a3a3a3',
                    border: '#262626',
                }
            },
            fontFamily: {
                'roboto-condensed': ['"Roboto Condensed"', 'sans-serif'],
                'inter': ['Inter', 'sans-serif'],
                'source-sans': ['"Source Sans 3"', 'sans-serif'],
                'jetbrains': ['"JetBrains Mono"', 'monospace'],
            },
            animation: {
                'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                'pulse-red': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                'glow': {
                    'from': { boxShadow: '0 0 5px rgba(220, 38, 38, 0.3)' },
                    'to': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)' },
                }
            },
            boxShadow: {
                'red-sm': '0 1px 2px 0 rgba(220, 38, 38, 0.05)',
                'red-md': '0 4px 6px -1px rgba(220, 38, 38, 0.1)',
                'red-lg': '0 10px 15px -3px rgba(220, 38, 38, 0.1)',
                'red-glow': '0 0 15px rgba(220, 38, 38, 0.4)',
            }
        },
    },
    plugins: [],
}
