/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn.discordapp.com',
      'tr.rbxcdn.com',
      'thumbnails.roblox.com',
      'files.catbox.moe'
    ],
  },
};

module.exports = nextConfig;
