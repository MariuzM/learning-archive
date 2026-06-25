const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: { appDir: true },
  env: { GREETING: process.env.NEXT_PUBLIC_PROJECT_ID },
  i18n,
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cryptologos.cc'],
  },
};

module.exports = nextConfig;
