import { redirect } from 'next/navigation';
import { fetchSiteContents } from '@/lib/api';

export const runtime = 'edge';

export default async function AboutIndexPage() {
	const pages = await fetchSiteContents({ type: 'about_page', activeOnly: true });
	const firstPageWithSlug = pages.find((item) => item.slug);
	if (firstPageWithSlug?.slug) {
		redirect(`/about/${firstPageWithSlug.slug}`);
	}

	return (
		<main className='min-h-screen bg-surface'>
			<section className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<div className='bg-white border border-border rounded-2xl p-10 text-center text-text-light'>
					目前尚未建立關於我們頁面。
				</div>
			</section>
		</main>
	);
}
