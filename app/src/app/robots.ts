import type { MetadataRoute } from 'next';

/**
 * robots.txt 設定
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/admin/', '/api/admin/'],
			},
		],
		sitemap: 'https://example.com/sitemap.xml',
	};
}
