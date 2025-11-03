/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, UPDATE',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'Content-Type, Authorization',
          },
        ]
      }
    ]
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      }
    ]
  },
  reactCompiler: true,

};

export default nextConfig;
