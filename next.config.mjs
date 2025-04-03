/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "www.sahyadri.edu.in",
        },
      ],
    },
  };
  
  export default nextConfig;
  