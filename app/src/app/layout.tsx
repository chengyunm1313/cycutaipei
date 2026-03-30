import type { Metadata } from 'next';
import { Inter, Noto_Sans_TC } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchSiteSettings } from '@/lib/api';
import './globals.css';

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
		default: '產品型錄平台 | 專業工業產品目錄',
		template: '%s | 產品型錄平台',
	},
	description: '提供最完整的工業產品型錄，涵蓋電子零件、機械設備、測量儀器與包裝材料。',
	keywords: ['產品型錄', '工業產品', '電子零件', '機械設備', '測量儀器'],
	openGraph: {
		title: '產品型錄平台',
		description: '提供最完整的工業產品型錄',
		type: 'website',
		locale: 'zh_TW',
	},
};

export async function generateMetadata(): Promise<Metadata> {
	try {
		const settings = await fetchSiteSettings();
		const siteName = settings.siteName?.trim() || '產品型錄平台';
		const title = settings.siteTitle?.trim() || `${siteName} | 專業工業產品目錄`;
		const description =
			settings.metaDescription?.trim() ||
			'提供最完整的工業產品型錄，涵蓋電子零件、機械設備、測量儀器與包裝材料。';
		const keywords = settings.metaKeywords
			? settings.metaKeywords
					.split(',')
					.map((item) => item.trim())
					.filter(Boolean)
			: ['產品型錄', '工業產品', '電子零件', '機械設備', '測量儀器'];

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
	let initialSiteName = '產品型錄平台';

	try {
		const settings = await fetchSiteSettings();
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
