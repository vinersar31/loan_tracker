/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // The repository name for GitHub Pages path mapping
  basePath: '/loan_tracker',
  // Make sure asset prefixes also match the base path
  assetPrefix: '/loan_tracker/',
};

export default nextConfig;
