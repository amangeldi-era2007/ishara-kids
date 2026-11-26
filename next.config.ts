import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  env: { NEXT_PUBLIC_CONTENT_BASE: process.env.GITHUB_PAGES === 'true' ? '/ishara-kids' : '' },
  basePath: process.env.GITHUB_PAGES === 'true' ? '/ishara-kids' : '',
};

export default nextConfig;
