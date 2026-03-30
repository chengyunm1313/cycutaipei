'use client';

import { useState } from 'react';
import MediaLibraryModal from './MediaLibraryModal';
import { getPrimaryImageUrl } from '@/lib/imageValue';

interface ImageSelectInputProps {
	value: string;
	onChange: (url: string) => void;
	label?: string;
}

export default function ImageSelectInput({
	value,
	onChange,
	label = '特色圖片',
}: ImageSelectInputProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const previewUrl = getPrimaryImageUrl(value);

	return (
		<div>
			<label className='block text-sm font-medium text-text mb-1.5'>{label}</label>
			{previewUrl ? (
				<div className='relative group rounded-xl overflow-hidden border border-border aspect-video bg-surface'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={previewUrl} alt='Featured' className='w-full h-full object-cover' />
					<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm'>
						<button
							type='button'
							onClick={() => setIsModalOpen(true)}
							className='px-3 py-1.5 text-sm font-medium bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors'
						>
							更換圖片
						</button>
						<button
							type='button'
							onClick={() => onChange('')}
							className='px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
						>
							移除圖片
						</button>
					</div>
				</div>
			) : (
				<button
					type='button'
					onClick={() => setIsModalOpen(true)}
					className='w-full flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-surface hover:bg-primary/5 transition-all text-text-muted hover:text-primary gap-2'
				>
					<svg
						className='w-8 h-8 opacity-50'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={1.5}
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z'
						/>
					</svg>
					<span className='text-sm font-medium'>從媒體庫或外部連結選擇圖片</span>
				</button>
			)}

			{isModalOpen && (
				<MediaLibraryModal
					onClose={() => setIsModalOpen(false)}
					onSelect={(url) => {
						onChange(url);
						setIsModalOpen(false);
					}}
				/>
			)}
		</div>
	);
}
