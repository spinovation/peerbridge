export default async function sitemap() {
  const baseUrl = 'https://peerbridge.ai';
  
  // Define public entry paths for search engine indexing
  const staticRoutes = [
    '',               // Landing Gate
    '/verify-mobile', // Mobile KYC portal
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  return staticRoutes;
}
