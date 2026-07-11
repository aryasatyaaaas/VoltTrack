import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "frame-ancestors 'none'",
              "worker-src 'self' blob:",
            ].join('; '),
          },
          // Allow geolocation — needed for station finder
          {
            key: 'Permissions-Policy',
            value: 'geolocation=*',
          },
        ],
      },
    ]
  },
}

export default nextConfig
