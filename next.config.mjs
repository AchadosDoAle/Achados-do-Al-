/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};


// BEGIN ACHADOS_DO_ALE_IMPACT_URL_VERIFICATION
// A URL publica contem ':'; o caractere precisa ser escapado no matcher do Next.js.
const impactVerificationRewrite = {
  source: "/Impact-Site-Verification\\:4ede9b56-c737-4654-bc16-fe2081d0f782",
  destination: "/impact-site-verification.html",
};
const rewritesAnterioresImpact = nextConfig.rewrites?.bind(nextConfig);
nextConfig.rewrites = async () => {
  const atuais = rewritesAnterioresImpact ? await rewritesAnterioresImpact() : [];
  if (Array.isArray(atuais)) return [impactVerificationRewrite, ...atuais];
  return {
    beforeFiles: [impactVerificationRewrite, ...(atuais.beforeFiles || [])],
    afterFiles: atuais.afterFiles || [],
    fallback: atuais.fallback || [],
  };
};
// END ACHADOS_DO_ALE_IMPACT_URL_VERIFICATION

export default nextConfig;
