import crypto from 'crypto';

const allowedEmail = process.env.ALLOWED_EMAIL || process.env.NEXT_PUBLIC_ALLOWED_EMAIL;
let allowedEmailHash = '';

if (allowedEmail) {
  allowedEmailHash = crypto.createHash('sha256').update(allowedEmail.toLowerCase().trim()).digest('hex');
}

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
  env: {
    NEXT_PUBLIC_ALLOWED_EMAIL_HASH: allowedEmailHash,
  },
};

export default nextConfig;
