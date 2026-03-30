import { notFound } from 'next/navigation';
import { fetchPageBySlug } from '@/lib/api';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { PageBlock } from '@/data/types';
import type { Metadata } from 'next';

export const runtime = 'edge';

interface Props {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
	try {
		const params = await props.params;
		const page = await fetchPageBySlug(params.slug);
		if (!page || page.status !== 'published') {
			return {
				title: 'Not Found',
			};
		}
		return {
			title: page.seoTitle || page.title,
			description: page.seoDescription || '',
		};
	} catch {
		return {
			title: 'Error',
		};
	}
}

export default async function DynamicPage(props: Props) {
	const params = await props.params;
	const page = await fetchPageBySlug(params.slug).catch((error) => {
		console.error('Error fetching page:', error);
		return null;
	});

	if (!page || page.status !== 'published') {
		notFound();
	}

	let blocks: PageBlock[] = [];
	if (page.content_blocks) {
		try {
			const parsed = JSON.parse(page.content_blocks) as PageBlock[];
			blocks = Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			console.error('Failed to parse page blocks:', error);
		}
	}

	return (
		<main className='min-h-screen bg-white'>
			{/* 這裡不再使用傳統的 title，而是讓區塊(如 Hero)負責呈現。若無任何區塊，還是秀個基本標題 */}
			{blocks.length === 0 ? (
				<div className='max-w-4xl mx-auto py-20 px-4'>
					<h1 className='text-4xl font-bold mb-4'>{page.title}</h1>
				</div>
			) : (
				<BlockRenderer blocks={blocks} />
			)}
		</main>
	);
}
