/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};

export default nextConfig;
