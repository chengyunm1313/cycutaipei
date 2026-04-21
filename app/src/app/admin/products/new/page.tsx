'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import { createProduct, fetchCategories } from '@/lib/api';
import type { ApiCategory } from '@/data/types';
import ImageSelectInput from '@/components/ImageSelectInput';
import CoverImagePositionControl from '@/components/CoverImagePositionControl';
import MultiImageSelectInput from '@/components/MultiImageSelectInput';
import EditorPublishToolbar from '@/components/admin/EditorPublishToolbar';
import dynamic from 'next/dynamic';
import { normalizeOptionalHttpUrl } from '@/lib/optionalUrl';
import { DEFAULT_COVER_IMAGE_POSITION_Y } from '@/lib/coverImagePosition';
import { slugifyAscii } from '@/lib/slug';

const BlockNoteEditor = dynamic(() => import('@/components/BlockNoteEditorWrapper'), {
	ssr: false,
});

/**
 * 後台 - 新增活動資訊
 * 表單送出至 D1 API
 */
export default function NewProductPage() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');
	const [description, setDescription] = useState('');
	const [categoryId, setCategoryId] = useState<number | ''>('');
	const [subcategoryId, setSubcategoryId] = useState<number | ''>('');
	const [status, setStatus] = useState<'published' | 'draft'>('draft');
	const [carouselImages, setCarouselImages] = useState<string[]>([]);
	const [listImage, setListImage] = useState('');
	const [coverImagePositionY, setCoverImagePositionY] = useState(DEFAULT_COVER_IMAGE_POSITION_Y);
	const [keywords, setKeywords] = useState('');
	const [purchaseLink, setPurchaseLink] = useState('');
	const [catalogLink, setCatalogLink] = useState('');
	const [introVideoUrl, setIntroVideoUrl] = useState('');
	const [isFeatured, setIsFeatured] = useState(false);
	const [sortOrder, setSortOrder] = useState<number>(0);
	const [postDate, setPostDate] = useState('');
	const [price, setPrice] = useState<number | ''>('');
	const [specs, setSpecs] = useState<{ label: string; value: string }[]>([]);
	const [content, setContent] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [submittingAction, setSubmittingAction] = useState<'published' | 'draft' | null>(null);
	const [categories, setCategories] = useState<ApiCategory[]>([]);

	useEffect(() => {
		fetchCategories().then(setCategories).catch(console.error);
	}, []);

	// 自動產生 slug
	const handleNameChange = (value: string) => {
		setName(value);
		if (!slug || slug === slugifyAscii(name, 'activity')) {
			setSlug(slugifyAscii(value, 'activity'));
		}
	};

	const handleSave = async (nextStatus: 'published' | 'draft') => {
		setError('');

		if (!name || !slug) {
			setError('請填寫活動資訊名稱與 Slug');
			return;
		}

		const normalizedPurchaseLink = normalizeOptionalHttpUrl(purchaseLink);
		if (purchaseLink.trim() && !normalizedPurchaseLink) {
			setError('前往購買連結格式不正確，請輸入完整網址或站內路徑（例如 /products）');
			return;
		}

		const normalizedCatalogLink = normalizeOptionalHttpUrl(catalogLink);
		if (catalogLink.trim() && !normalizedCatalogLink) {
			setError('附件連結格式不正確，請輸入完整網址或站內路徑（例如 /files/activity-guide.pdf）');
			return;
		}

		const normalizedIntroVideoUrl = normalizeOptionalHttpUrl(introVideoUrl);
		if (introVideoUrl.trim() && !normalizedIntroVideoUrl) {
			setError('介紹影片連結格式不正確，請輸入完整網址');
			return;
		}

		setSubmitting(true);
		setSubmittingAction(nextStatus);
		try {
			const product = await createProduct({
				name,
				slug: slugifyAscii(slug, 'activity'),
				description: description || null,
				categoryId: categoryId === '' ? null : categoryId,
				subcategoryId: subcategoryId === '' ? null : subcategoryId,
				status: nextStatus,
				images: carouselImages.length > 0 ? JSON.stringify(carouselImages) : null,
				listImage: listImage || null,
				coverImagePositionY,
				keywords: keywords || null,
				price: price === '' ? null : Number(price),
				purchaseLink: normalizedPurchaseLink,
				catalogLink: normalizedCatalogLink,
				introVideoUrl: normalizedIntroVideoUrl,
				specs: specs.length > 0 ? JSON.stringify(specs) : null,
				isFeatured,
				sortOrder,
				postDate: postDate || null,
				content: content || null,
			});
			setStatus(nextStatus);
			alert(`活動資訊已${nextStatus === 'published' ? '發布' : '儲存為草稿'}！`);
			router.push(`/admin/products/${product.id}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : '新增失敗');
		} finally {
			setSubmitting(false);
			setSubmittingAction(null);
		}
	};

	return (
		<div className='max-w-2xl'>
			<EditorPublishToolbar
				backHref='/admin/products'
				title='新增活動資訊'
				status={status}
				onSaveDraft={() => void handleSave('draft')}
				onPublish={() => void handleSave('published')}
				isSubmitting={submitting}
				submittingAction={submittingAction}
				meta='上方即可直接儲存草稿或發布，不必再往下捲找上架選項。'
			/>

			<div className='bg-card rounded-xl border border-border p-6'>
				<form
					onSubmit={(event) => event.preventDefault()}
					noValidate
					className='space-y-5'
				>
					{error && (
						<div className='bg-error/10 text-error text-sm px-4 py-2.5 rounded-lg'>{error}</div>
					)}

					<div>
						<label htmlFor='name' className='block text-sm font-medium text-text mb-1.5'>
							活動名稱 <span className='text-error'>*</span>
						</label>
						<input
							id='name'
							type='text'
							value={name}
							onChange={(e) => handleNameChange(e.target.value)}
							placeholder='例：四月校友聯誼講座'
							required
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
						/>
					</div>

					<div>
						<label htmlFor='slug' className='block text-sm font-medium text-text mb-1.5'>
							Slug <span className='text-error'>*</span>
						</label>
						<input
							id='slug'
							type='text'
							value={slug}
							onChange={(e) => setSlug(slugifyAscii(e.target.value, 'activity'))}
							placeholder='mcu-3200'
							required
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 font-mono'
						/>
						<p className='text-xs text-text-light mt-1'>輸入中文也會自動轉成安全網址格式</p>
					</div>

					<div>
						<label htmlFor='description' className='block text-sm font-medium text-text mb-1.5'>
							活動摘要：
						</label>
						<textarea
							id='description'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder='簡要說明活動亮點、對象與內容...'
							rows={4}
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 resize-none'
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='postDate' className='block text-sm font-medium text-text mb-1.5'>
								原始活動日期
							</label>
							<input
								id='postDate'
								type='date'
								value={postDate}
								onChange={(e) => setPostDate(e.target.value)}
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='price' className='block text-sm font-medium text-text mb-1.5'>
								價錢：
							</label>
							<input
								id='price'
								type='number'
								value={price}
								onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
								placeholder='可填寫報名費、餐費或留空'
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='keywords' className='block text-sm font-medium text-text mb-1.5'>
								關鍵字 (SEO)
							</label>
							<input
								id='keywords'
								type='text'
								value={keywords}
								onChange={(e) => setKeywords(e.target.value)}
								placeholder='例：微控制器, 晶片, 開發板 (請以逗號分隔)'
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='purchaseLink' className='block text-sm font-medium text-text mb-1.5'>
								前往購買連結：
							</label>
							<input
								id='purchaseLink'
								type='text'
								inputMode='url'
								value={purchaseLink}
								onChange={(e) => setPurchaseLink(e.target.value)}
								placeholder='填寫連結'
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='catalogLink' className='block text-sm font-medium text-text mb-1.5'>
								附件連結：
							</label>
							<input
								id='catalogLink'
								type='text'
								inputMode='url'
								value={catalogLink}
								onChange={(e) => setCatalogLink(e.target.value)}
								placeholder='活動簡章、報名表或相關附件連結'
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>

						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='introVideoUrl' className='block text-sm font-medium text-text mb-1.5'>
								介紹影片：
							</label>
							<input
								id='introVideoUrl'
								type='text'
								inputMode='url'
								value={introVideoUrl}
								onChange={(e) => setIntroVideoUrl(e.target.value)}
								placeholder='影片路徑 (請輸入 youtube iframe 裡的 src 網址)'
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='sortOrder' className='block text-sm font-medium text-text mb-1.5'>
								排序：
							</label>
							<input
								id='sortOrder'
								type='number'
								value={sortOrder}
								onChange={(e) => setSortOrder(Number(e.target.value))}
								placeholder='數字大的會排到前面'
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='col-span-2 sm:col-span-1 space-y-4'>
							<MultiImageSelectInput
								label='介紹圖片 (輪播)：'
								value={carouselImages}
								onChange={setCarouselImages}
							/>
							<p className='text-xs text-text-light -mt-2'>
								圖片尺寸比例為2:1，建議尺寸2000x1000，可新增多張並用「往前 / 往後」調整順序
							</p>

							<ImageSelectInput label='活動列表圖片：' value={listImage} onChange={setListImage} />
							<CoverImagePositionControl
								label='活動封面顯示位置'
								value={coverImagePositionY}
								onChange={setCoverImagePositionY}
								previewUrl={listImage || carouselImages[0]}
							/>
							<p className='text-xs text-text-light -mt-2'>圖片尺寸比例為2:1，建議尺寸960x480</p>

							<div>
								<label className='block text-sm font-medium text-text mb-1.5'>活動資訊欄位：</label>
								<div className='bg-surface rounded-lg border border-border p-4 space-y-3 mb-2'>
									{specs.map((spec, index) => (
										<div key={index} className='flex gap-2 items-start'>
											<input
												type='text'
												value={spec.label}
												onChange={(e) => {
													const newSpecs = [...specs];
													newSpecs[index].label = e.target.value;
													setSpecs(newSpecs);
												}}
												placeholder='名稱 (例如: 活動時間)'
												className='flex-1 px-3 py-2 text-sm bg-card rounded-md border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200'
											/>
											<input
												type='text'
												value={spec.value}
												onChange={(e) => {
													const newSpecs = [...specs];
													newSpecs[index].value = e.target.value;
													setSpecs(newSpecs);
												}}
												placeholder='內容 (例如: 4/20 14:00-16:00)'
												className='flex-1 px-3 py-2 text-sm bg-card rounded-md border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200'
											/>
											<button
												type='button'
												onClick={() => {
													const newSpecs = [...specs];
													newSpecs.splice(index, 1);
													setSpecs(newSpecs);
												}}
												className='p-2 text-error hover:bg-error/10 rounded-md transition-colors'
												title='移除規格'
											>
												<svg
													className='w-4 h-4'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
													strokeWidth={2}
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														d='M6 18L18 6M6 6l12 12'
													/>
												</svg>
											</button>
										</div>
									))}
									<button
										type='button'
										onClick={() => setSpecs([...specs, { label: '', value: '' }])}
										className='px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-md hover:bg-primary/20 transition-colors duration-200 cursor-pointer flex items-center gap-1.5'
									>
										<svg
											className='w-4 h-4'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
											strokeWidth={2}
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M12 4.5v15m7.5-7.5h-15'
											/>
										</svg>
										新增欄位
									</button>
								</div>
							</div>
						</div>

						<div className='col-span-2 sm:col-span-1 space-y-4'>
							<div>
								<label htmlFor='category' className='block text-sm font-medium text-text mb-1.5'>
									活動主分類：
								</label>
								<select
									id='category'
									value={categoryId}
									onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
									className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
								>
									<option value=''>未分類</option>
									{categories
										.filter((cat) => !cat.parentId)
										.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.name}
											</option>
										))}
								</select>
							</div>

							<div>
								<label
									htmlFor='subcategoryId'
									className='block text-sm font-medium text-text mb-1.5'
								>
									活動子分類：
								</label>
								<select
									id='subcategoryId'
									value={subcategoryId}
									onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}
									className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
								>
									<option value=''>無次分類</option>
									{categories
										.filter((cat) => cat.parentId === categoryId)
										.map((cat) => (
											<option key={cat.id} value={cat.id}>
												{cat.name}
											</option>
										))}
								</select>
							</div>

							<div className='flex items-center gap-2 mt-2 pt-2 border-t border-border'>
								<input
									type='checkbox'
									id='isFeatured'
									checked={isFeatured}
									onChange={(e) => setIsFeatured(e.target.checked)}
									className='w-4 h-4 rounded text-primary focus:ring-primary border-border bg-surface'
								/>
								<label
									htmlFor='isFeatured'
									className='text-sm font-medium text-text cursor-pointer'
								>
									設為精選活動
								</label>
							</div>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-text mb-1.5'>活動內容：</label>
						<BlockNoteEditor initialHTML='' onChange={setContent} />
					</div>
				</form>
			</div>
		</div>
	);
}
