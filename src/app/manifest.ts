import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vimero AI - Digital Business Command Center',
    short_name: 'Vimero',
    description: 'Aplikasi pusat kendali bisnis dan mesin konten berbasis AI.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    orientation: 'portrait-primary',
    screenshots: [
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
  }
}
