import type { MetadataRoute } from 'next';
import { products, categories } from '@/data/mock';

/**
 * 自動產生 sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://example.com';

	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
		{
			url: `${baseUrl}/products`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.9,
		},
	];

	const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
		url: `${baseUrl}/category/${cat.slug}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: 0.8,
	}));

	const productRoutes: MetadataRoute.Sitemap = products
		.filter((p) => p.status === 'published')
		.map((p) => ({
			url: `${baseUrl}/product/${p.slug}`,
			lastModified: new Date(p.updatedAt),
			changeFrequency: 'weekly' as const,
			priority: 0.7,
		}));

	return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
