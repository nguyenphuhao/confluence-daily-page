/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  }
}
process.env.TZ = 'Asia/Bangkok';
module.exports = nextConfig
