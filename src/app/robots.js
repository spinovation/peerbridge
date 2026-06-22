export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/verify-mobile',
      ],
      disallow: [
        '/api/',        // Serverless API route paths
        '/dashboard/',  // User core dashboard panels
        '/profile/',    // User settings and wallet modules
        '/admin/',      // Sales operations controls
      ],
    },
    sitemap: 'https://peerbridge.ai/sitemap.xml',
  };
}
