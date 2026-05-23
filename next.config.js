/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'obcxbjxyznbzvgxwptvi.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const redirects = [];

    // Force www redirect: naked domain bandigaredappalto.it → www.bandigaredappalto.it
    if (siteUrl) {
      try {
        const url = new URL(siteUrl);
        if (url.hostname.startsWith('www.')) {
          const nakedDomain = url.hostname.replace('www.', '');
          redirects.push({
            source: '/:path*',
            has: [{ type: 'host', value: nakedDomain }],
            destination: `${siteUrl}/:path*`,
            permanent: true,
          });
        }
      } catch {}
    }

    // La rotta canonica del dettaglio bando è /bandi/[slug].
    // Eventuali link legacy /bando/[slug] (dal clone italia-cantieri) vengono redirezionati.
    redirects.push({ source: '/bando/:slug', destination: '/bandi/:slug', permanent: true });

    return redirects;
  },
};

module.exports = nextConfig;
