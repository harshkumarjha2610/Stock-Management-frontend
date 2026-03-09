// next.config.js
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',                          // ✅ Cloudinary
      'cobuild-simulator-backend.onrender.com',      // ✅ Backend local uploads
    ],
  },
};

module.exports = nextConfig;
