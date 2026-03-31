import AppLink from '@/components/AppLink';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchSiteContents } from '@/lib/api';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { PageBlock } from '@/data/types';

export const runtime = 'edge';

const CHARTER_FILE_URL = '/docs/cycu-alumni-charter-11th.pdf';
const BOARD_MEMBERS = [
	{ role: '理事長', name: '洪千惠' },
	{ role: '副理事長', name: '張意良' },
	{ role: '常務理事', name: '陳勇任' },
	{ role: '常務理事', name: '林獻堂' },
	{ role: '理事', name: '呂世傑' },
	{ role: '理事', name: '郭里雲' },
	{ role: '理事', name: '王榮助' },
	{ role: '理事', name: '彭建生' },
	{ role: '理事', name: '陳慧敏' },
	{ role: '理事', name: '張宏瑋' },
	{ role: '理事', name: '王永生' },
	{ role: '理事', name: '張豐國' },
	{ role: '理事', name: '徐享' },
	{ role: '監事', name: '林正忠' },
	{ role: '監事', name: '孟祥治' },
	{ role: '監事', name: '郭鵬霄' },
	{ role: '總幹事', name: '林霏虹' },
];

interface AboutExtras {
	image2?: string;
	image3?: string;
	content_blocks?: PageBlock[];
}

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const pages = await fetchSiteContents({ type: 'about_page', slug });
	const page = pages[0];
	if (!page) return { title: '關於我們' };
	return {
		title: page.title || '關於我們',
		description: page.summary || undefined,
	};
}

export default async function AboutDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const allPages = await fetchSiteContents({ type: 'about_page', activeOnly: true });
	const page = allPages.find((item) => item.slug === slug);
	if (!page) notFound();

	let extras: AboutExtras = {};
	if (page.extraJson) {
		try {
			extras = JSON.parse(page.extraJson) as AboutExtras;
		} catch {
			extras = {};
		}
	}

	const media = [page.imageUrl, extras.image2, extras.image3].filter(Boolean) as string[];
	const shouldShowCharter = page.slug === 'organization-profile';
	const chairMembers = BOARD_MEMBERS.filter((member) => ['理事長', '副理事長', '常務理事', '總幹事'].includes(member.role));
	const directors = BOARD_MEMBERS.filter((member) => member.role === '理事');
	const supervisors = BOARD_MEMBERS.filter((member) => member.role === '監事');

	return (
		<main className='min-h-screen bg-[#f3f3f3]'>
			{/* 保留原有的上方導覽與分頁切換功能 */}
			<section className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4'>
				<div className='text-sm text-text-muted mb-6'>
					<AppLink href='/' className='hover:text-primary'>
						首頁
					</AppLink>{' '}
					&gt;{' '}
					<AppLink href='/about' className='hover:text-primary'>
						關於我們
					</AppLink>{' '}
					&gt; <span>{page.title || '未命名頁面'}</span>
				</div>

				<div className='text-center mb-6'>
					<div className='flex flex-wrap items-center justify-center gap-y-2'>
						{allPages.map((item, index) => {
							const isActive = item.id === page.id;
							return (
								<div key={item.id} className='inline-flex items-center'>
									{index > 0 && <span className='mx-4 text-text-light'>|</span>}
									<AppLink
										href={item.slug ? `/about/${item.slug}` : '/about'}
										className={`text-lg ${
											isActive ? 'font-bold text-text' : 'text-text-muted hover:text-primary'
										}`}
									>
										{item.title || '未命名頁面'}
									</AppLink>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{Array.isArray(extras.content_blocks) && extras.content_blocks.length > 0 ? (
				<BlockRenderer blocks={extras.content_blocks} />
			) : (
				/* 舊版的渲染邏輯 (向下相容) */
				<section className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10'>
					<div className='text-center'>
						<h1 className='text-4xl font-black text-text'>關於我們</h1>
					</div>

					{media.length > 0 && (
						<div className='mt-10 rounded-[28px] overflow-hidden border border-border'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={media[0]}
								alt={page.title || 'about'}
								className='w-full h-[280px] md:h-[420px] object-cover'
							/>
						</div>
					)}

					{page.summary && (
						<div className='mt-10 text-center'>
							<p className='text-3xl font-medium text-[#58c27d]'>| {page.summary} |</p>
							<div className='w-full h-1 bg-[#e4c264] mt-4' />
						</div>
					)}

					<div className='mt-8 text-[22px] leading-10 text-text'>
						<div
							className='prose prose-slate max-w-none'
							dangerouslySetInnerHTML={{
								__html: page.content || '<p>尚未填寫內容</p>',
							}}
						/>
					</div>

					{page.linkUrl && (
						<div className='mt-8'>
							<a
								href={page.linkUrl}
								target='_blank'
								rel='noreferrer'
								className='inline-flex items-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors'
							>
								More 前往連結
							</a>
						</div>
					)}

					{shouldShowCharter && (
						<div className='mt-10 space-y-8'>
							<section className='rounded-3xl border border-border bg-white px-6 py-7 sm:px-8'>
								<div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
									<div>
										<p className='text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-2'>
											章程下載
										</p>
										<h2 className='text-2xl font-bold text-text'>中華民國中原大學校友總會章程</h2>
										<p className='text-text-muted mt-2'>
											提供第 11 屆章程 PDF，方便校友查閱組織宗旨、會員權利義務與會務規範。
										</p>
									</div>
									<div className='flex flex-wrap gap-3'>
										<a
											href={CHARTER_FILE_URL}
											target='_blank'
											rel='noreferrer'
											className='inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors'
										>
											開啟章程 PDF
										</a>
										<a
											href={CHARTER_FILE_URL}
											download='中華民國中原大學校友總會章程(11屆).pdf'
											className='inline-flex items-center justify-center px-5 py-3 rounded-xl border border-border text-text text-sm font-semibold hover:bg-surface transition-colors'
										>
											下載章程
										</a>
									</div>
								</div>
							</section>

							<section className='rounded-3xl border border-border bg-white px-6 py-7 sm:px-8'>
								<div className='max-w-3xl'>
									<p className='text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-2'>
										理監事名單
									</p>
									<h2 className='text-2xl font-bold text-text'>第24屆理監事與會務人員</h2>
									<p className='text-text-muted mt-2'>
										名單依 2024 年 12 月 2 日會員資料整理，方便校友快速查閱本屆主要幹部與理監事編制。
									</p>
								</div>

								<div className='mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]'>
									<div className='rounded-2xl bg-surface px-5 py-5'>
										<h3 className='text-lg font-bold text-text'>主要幹部</h3>
										<div className='mt-4 space-y-3'>
											{chairMembers.map((member) => (
												<div
													key={`${member.role}-${member.name}`}
													className='flex items-center justify-between gap-4 rounded-xl border border-border bg-white px-4 py-3'
												>
													<span className='text-sm font-semibold text-text-muted'>{member.role}</span>
													<span className='text-base font-bold text-text'>{member.name}</span>
												</div>
											))}
										</div>
									</div>

									<div className='rounded-2xl bg-surface px-5 py-5'>
										<h3 className='text-lg font-bold text-text'>監事名單</h3>
										<div className='mt-4 space-y-3'>
											{supervisors.map((member) => (
												<div
													key={`${member.role}-${member.name}`}
													className='flex items-center justify-between gap-4 rounded-xl border border-border bg-white px-4 py-3'
												>
													<span className='text-sm font-semibold text-text-muted'>{member.role}</span>
													<span className='text-base font-bold text-text'>{member.name}</span>
												</div>
											))}
										</div>
									</div>
								</div>

								<div className='mt-6 rounded-2xl bg-surface px-5 py-5'>
									<div className='flex items-center justify-between gap-4'>
										<h3 className='text-lg font-bold text-text'>理事名單</h3>
										<span className='text-sm font-semibold text-text-muted'>{directors.length} 位</span>
									</div>
									<div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
										{directors.map((member) => (
											<div
												key={`${member.role}-${member.name}`}
												className='rounded-xl border border-border bg-white px-4 py-3'
											>
												<p className='text-sm font-semibold text-text-muted'>{member.role}</p>
												<p className='mt-1 text-base font-bold text-text'>{member.name}</p>
											</div>
										))}
									</div>
								</div>
							</section>
						</div>
					)}
				</section>
			)}
		</main>
	);
}
