'use client';

import { DEFAULT_COVER_IMAGE_POSITION_Y, getCoverImageObjectPositionStyle } from '@/lib/coverImagePosition';

interface CoverImagePositionControlProps {
	value: number;
	onChange: (value: number) => void;
	previewUrl?: string;
	label?: string;
	description?: string;
}

const PRESET_POSITIONS = [
	{ label: '置頂', value: 0 },
	{ label: '置中', value: 50 },
	{ label: '置底', value: 100 },
];

export default function CoverImagePositionControl({
	value,
	onChange,
	previewUrl,
	label = '封面顯示位置',
	description = '調整封面圖在卡片與詳情頁中的上下焦點位置。',
}: CoverImagePositionControlProps) {
	return (
		<div className='rounded-xl border border-border bg-surface p-4 space-y-4'>
			<div>
				<p className='text-sm font-medium text-text'>{label}</p>
				<p className='text-xs text-text-light mt-1'>{description}</p>
			</div>

			<div className='flex flex-wrap gap-2'>
				{PRESET_POSITIONS.map((preset) => {
					const isActive = value === preset.value;
					return (
						<button
							key={preset.label}
							type='button'
							onClick={() => onChange(preset.value)}
							className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 cursor-pointer ${
								isActive
									? 'bg-primary text-white border-primary'
									: 'bg-white text-text-muted border-border hover:border-primary/40 hover:text-text'
							}`}
						>
							{preset.label}
						</button>
					);
				})}
			</div>

			<div>
				<div className='flex items-center justify-between text-xs text-text-light mb-2'>
					<span>靠上</span>
					<span>{value}%</span>
					<span>靠下</span>
				</div>
				<input
					type='range'
					min={0}
					max={100}
					step={1}
					value={value}
					onChange={(event) => onChange(Number(event.target.value))}
					className='w-full accent-primary cursor-pointer'
				/>
			</div>

			<div>
				<p className='text-xs font-medium text-text-muted uppercase tracking-wider mb-2'>預覽</p>
				<div className='relative rounded-xl overflow-hidden border border-border aspect-[16/9] bg-card'>
					{previewUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={previewUrl}
							alt='封面焦點位置預覽'
							className='w-full h-full object-cover'
							style={getCoverImageObjectPositionStyle(value)}
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center text-sm text-text-light px-4 text-center'>
							請先選擇封面圖，再調整顯示位置
						</div>
					)}
				</div>
				<p className='text-[11px] text-text-light mt-2'>
					預設值為 {DEFAULT_COVER_IMAGE_POSITION_Y}%；列表卡片與詳情頁會共用同一組設定。
				</p>
			</div>
		</div>
	);
}
