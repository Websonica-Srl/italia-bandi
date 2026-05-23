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

    // Force www redirect: naked domain italiacantieri.it → www.italiacantieri.it
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

    // Privacy unica: la vecchia pagina "come trattiamo i dati" confluisce nella Privacy Policy.
    redirects.push(
      { source: '/come-trattiamo-i-dati', destination: '/legal/privacy', permanent: true },
      { source: '/come-trattiamo-i-dati/:path*', destination: '/legal/privacy', permanent: true },
    );

    return redirects;
  },
};

module.exports = nextConfig;
