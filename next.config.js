/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['images.unsplash.com'],
    },
    serverExternalPackages: ['chromadb'],
};

module.exports = nextConfig;
