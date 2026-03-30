import type { NextConfig } from 'next';
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
	setupDevPlatform();
}

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'images.pexels.com',
			},
			{
				protocol: 'https',
				hostname: 'cdn.pixabay.com',
			},
		],
	},
	// Cloudflare Pages 部署時所需的設定，如果是靜態輸出（純 HTML）
	// output: 'export',
	// 但因為要用到 D1 資料庫，我們需要使用 Next.js 的 Edge Runtime 模式 (SSR)
};

export default nextConfig;
