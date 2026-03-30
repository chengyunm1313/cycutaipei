import type { Metadata } from 'next';
import { Inter, Noto_Sans_TC } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchSiteSettings } from '@/lib/api';
import './globals.css';

export const dynamic = 'force-dynamic';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap',
});

const notoSansTC = Noto_Sans_TC({
	variable: '--font-noto-sans-tc',
	subsets: ['latin'],
	display: 'swap',
});

const defaultMetadata: Metadata = {
	title: {
		default: '中原大學台北市校友會 | 校友交流與活動平台',
		template: '%s | 中原大學台北市校友會',
	},
	description: '串聯中原大學台北市校友情誼，提供最新消息、活動資訊與校友會相關服務。',
	keywords: ['中原大學', '台北市校友會', '校友活動', '最新消息', '校友服務'],
	openGraph: {
		title: '中原大學台北市校友會',
		description: '串聯中原大學台北市校友情誼，提供最新消息、活動資訊與校友會相關服務。',
		type: 'website',
		locale: 'zh_TW',
	},
};

export async function generateMetadata(): Promise<Metadata> {
	try {
		const settings = await fetchSiteSettings({
			next: { revalidate: 0 },
		});
		const siteName = settings.siteName?.trim() || '中原大學台北市校友會';
		const title = settings.siteTitle?.trim() || `${siteName} | 校友交流與活動平台`;
		const description =
			settings.metaDescription?.trim() ||
			'串聯中原大學台北市校友情誼，提供最新消息、活動資訊與校友會相關服務。';
		const keywords = settings.metaKeywords
			? settings.metaKeywords
					.split(',')
					.map((item) => item.trim())
					.filter(Boolean)
			: ['中原大學', '台北市校友會', '校友活動', '最新消息', '校友服務'];

		return {
			title: {
				default: title,
				template: `%s | ${siteName}`,
			},
			description,
			keywords,
			icons: settings.faviconUrl ? { icon: settings.faviconUrl } : undefined,
			openGraph: {
				title: siteName,
				description,
				type: 'website',
				locale: 'zh_TW',
				images: settings.socialShareImageUrl ? [{ url: settings.socialShareImageUrl }] : undefined,
			},
		};
	} catch {
		return defaultMetadata;
	}
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	let initialSiteName = '中原大學台北市校友會';

	try {
		const settings = await fetchSiteSettings({
			next: { revalidate: 0 },
		});
		if (settings.siteName?.trim()) {
			initialSiteName = settings.siteName.trim();
		}
	} catch (error) {
		console.error('Layout site settings load error:', error);
	}

	return (
		<html lang='zh-TW' suppressHydrationWarning>
			<body className={`${inter.variable} ${notoSansTC.variable} antialiased`}>
				<Navbar initialSiteName={initialSiteName} />
				<main className='pt-16 min-h-screen'>{children}</main>
				<Footer />
			</body>
		</html>
	);
}
