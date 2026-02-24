import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PuffPay - Debt Tracker',
        short_name: 'PuffPay',
        description: 'Track debts and expenses with friends.',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#09090b',
        icons: [
            {
                src: '/icons/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable' as any
            },
            {
                src: '/icons/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable' as any
            },
        ],
    }
}
