/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/grupo",
        destination: "https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
