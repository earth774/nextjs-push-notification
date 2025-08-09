// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false, // We'll register manually
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/,
    /sw-custom\.js$/,
    /sw-notification\.js$/
  ],
  publicExcludes: [
    '!robots.txt',
    '!sitemap.xml',
    '!sw-custom.js',
    '!sw-notification.js'
  ],
  fallbacks: {
    document: '/offline'
  }
})

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  reactStrictMode: true,
})

module.exports = nextConfig