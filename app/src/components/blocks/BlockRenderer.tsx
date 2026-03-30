import Image from 'next/image';
import AppLink from '@/components/AppLink';
import type { PageBlock, HeroBlockData, TextBlockData, CarouselBlockData } from '@/data/types';

export default function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
	if (!blocks || blocks.length === 0) {
		return null;
	}

	return (
		<div className='flex flex-col w-full'>
			{blocks.map((block) => (
				<div key={block.id} className='w-full'>
					{renderBlock(block)}
				</div>
			))}
		</div>
	);
}

function renderBlock(block: PageBlock) {
	switch (block.type) {
		case 'hero':
			return <HeroBlock data={block.data as HeroBlockData} />;
		case 'text':
			return <TextBlock data={block.data as TextBlockData} />;
		case 'image':
			return <ImageBlock data={{ url: block.data.url, alt: block.data.alt }} />;
		case 'carousel':
			return <CarouselBlock data={block.data as CarouselBlockData} />;
		default:
			return (
				<div className='p-4 border border-dashed border-red-300 text-red-500'>
					Unknown Block Type: {block.type}
				</div>
			);
	}
}

function HeroBlock({ data }: { data: HeroBlockData }) {
	return (
		<section className='relative w-full min-h-[500px] flex items-center justify-center bg-gray-900 text-white overflow-hidden py-20 px-4'>
			{data.imageUrl && (
				<Image
					src={data.imageUrl}
					alt={data.title}
					fill
					className='object-cover opacity-40'
					priority
				/>
			)}
			<div className='relative z-10 text-center max-w-4xl mx-auto'>
				<h1 className='text-4xl md:text-6xl font-black tracking-tight mb-6 drop-shadow-md'>
					{data.title}
				</h1>
				{data.subtitle && (
					<p className='text-lg md:text-2xl mb-8 text-gray-200 drop-shadow-sm font-light leading-relaxed max-w-2xl mx-auto'>
						{data.subtitle}
					</p>
				)}
				{data.ctaText && data.ctaLink && (
					<AppLink
						href={data.ctaLink}
						className='inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-900 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl'
					>
						{data.ctaText}
					</AppLink>
				)}
			</div>
		</section>
	);
}

function TextBlock({ data }: { data: TextBlockData }) {
	const alignmentClass =
		data.align === 'center' ? 'text-center' : data.align === 'right' ? 'text-right' : 'text-left';

	return (
		<section className='py-16 px-4 md:px-8'>
			<div
				className={`max-w-4xl mx-auto prose prose-lg md:prose-xl text-gray-800 ${alignmentClass}`}
				dangerouslySetInnerHTML={{ __html: data.content }}
			/>
		</section>
	);
}

function ImageBlock({ data }: { data: { url: string; alt?: string } }) {
	if (!data.url) return null;
	return (
		<section className='py-8 px-4'>
			<div className='max-w-5xl mx-auto relative rounded-2xl overflow-hidden shadow-2xl'>
				<img
					src={data.url}
					alt={data.alt || 'Image'}
					className='w-full h-auto object-cover block'
					loading='lazy'
				/>
			</div>
		</section>
	);
}

function CarouselBlock({ data }: { data: CarouselBlockData }) {
	if (!data.images || data.images.length === 0) return null;

	// 基礎的 CSS Scroll Snap 輪播實作
	return (
		<section className='py-12 px-4'>
			<div className='max-w-6xl mx-auto'>
				<div className='flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar'>
					{data.images.map((img, idx) => (
						<div
							key={idx}
							className='flex-none w-[80vw] md:w-[60vw] max-w-2xl aspect-[16/9] snap-center relative rounded-2xl overflow-hidden shadow-lg border border-gray-100'
						>
							<img
								src={img}
								alt={`Slide ${idx + 1}`}
								className='w-full h-full object-cover'
								loading='lazy'
							/>
						</div>
					))}
				</div>
			</div>
			<style
				dangerouslySetInnerHTML={{
					__html: `
				.hide-scrollbar::-webkit-scrollbar { display: none; }
				.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
			`,
				}}
			/>
		</section>
	);
}
