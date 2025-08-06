// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,//process.env.NODE_ENV === 'development', // disable in dev if desired
  buildExcludes: [/middleware-manifest\.json$/], // avoid conflicts with app router
})

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  experimental: {
    appDir: true
  },
  reactStrictMode: true,
})

module.exports = nextConfig