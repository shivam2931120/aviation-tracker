/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_AVIATIONSTACK_API_KEY: string
    readonly VITE_OPENSKY_CLIENT_ID: string
    readonly VITE_OPENSKY_CLIENT_SECRET: string
    readonly VITE_OPENSKY_API_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
