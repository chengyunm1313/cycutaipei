import AppLink from '@/components/AppLink';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchSiteContents } from '@/lib/api';

export const runtime = 'edge';

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const pages = await fetchSiteContents({ type: 'faq_page', slug });
	const page = pages[0];
	if (!page) return { title: '常見問題' };
	return {
		title: page.title || '常見問題',
		description: page.summary || undefined,
	};
}

export default async function FaqDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const allPages = await fetchSiteContents({ type: 'faq_page', activeOnly: true });
	const page = allPages.find((item) => item.slug === slug);
	if (!page) redirect('/faq');

	const items = await fetchSiteContents({ type: 'faq_item', parentId: page.id, activeOnly: true });

	return (
		<main className='min-h-screen bg-[#f3f3f3]'>
			<section className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
				<div className='text-sm text-text-muted mb-6'>
					<AppLink href='/' className='hover:text-primary'>
						首頁
					</AppLink>{' '}
					&gt; <span>常見問題</span>
				</div>

				<div className='text-center'>
					<h1 className='text-4xl font-black text-text'>常見問題</h1>
					<div className='mt-5 flex flex-wrap items-center justify-center gap-y-2'>
						{allPages.map((item, index) => {
							const isActive = item.id === page.id;
							return (
								<div key={item.id} className='inline-flex items-center'>
									{index > 0 && <span className='mx-4 text-text-light'>|</span>}
									<AppLink
										href={item.slug ? `/faq/${item.slug}` : '/faq'}
										className={`text-lg ${
											isActive
												? 'font-bold text-text'
												: 'text-text-muted hover:text-primary'
										}`}
									>
										{item.title || '未命名頁面'}
									</AppLink>
								</div>
							);
						})}
					</div>
				</div>

				<div className='mt-10 space-y-4'>
					{items.map((item) => (
						<details key={item.id} className='group'>
							<summary className='list-none cursor-pointer rounded-2xl bg-[#69c983] text-white px-6 py-4 text-2xl font-medium flex items-center justify-between'>
								<span>{item.title || '未命名問題'}</span>
								<span className='text-4xl leading-none'>
									<span className='group-open:hidden'>+</span>
									<span className='hidden group-open:inline'>−</span>
								</span>
							</summary>
							<div className='bg-white border border-[#69c983] border-t-0 rounded-b-2xl px-6 py-5 text-[24px] leading-10 text-text'>
								<div
									className='prose prose-slate max-w-none'
									dangerouslySetInnerHTML={{ __html: item.content || '<p>尚未填寫回答</p>' }}
								/>
							</div>
						</details>
					))}

					{items.length === 0 && (
						<div className='bg-white border border-border rounded-2xl p-10 text-center text-text-light'>
							目前尚未建立問答內容。
						</div>
					)}
				</div>
			</section>
		</main>
	);
}
