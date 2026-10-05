import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://piyade-rp.up.railway.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/yetkili', '/kurucu', '/panel'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
