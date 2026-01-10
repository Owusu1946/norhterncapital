import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Northern Capital Hotel Admin',
        short_name: 'NCH Admin',
        description: 'Admin Dashboard for Northern Capital Hotel',
        start_url: '/admin',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#01a4ff',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
