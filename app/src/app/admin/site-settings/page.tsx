'use client';

import { useEffect, useState } from 'react';
import ImageSelectInput from '@/components/ImageSelectInput';
import { fetchSiteSettings, updateSiteSettings } from '@/lib/api';
import type { ApiSiteSettings } from '@/data/types';

interface SiteSettingsFormState {
	siteName: string;
	siteTitle: string;
	logoUrl: string;
	footerLogoUrl: string;
	faviconUrl: string;
	socialShareImageUrl: string;
	metaDescription: string;
	metaKeywords: string;
	contactLink: string;
	taxId: string;
	phone: string;
	fax: string;
	address: string;
	email: string;
	facebookUrl: string;
	instagramUrl: string;
	youtubeUrl: string;
	lineUrl: string;
	copyright: string;
	enquirySubjects: string[];
}

const defaultFormState: SiteSettingsFormState = {
	siteName: '中原大學台北市校友會',
	siteTitle: '中原大學台北市校友會 | 校友交流與活動平台',
	logoUrl: '',
	footerLogoUrl: '',
	faviconUrl: '',
	socialShareImageUrl: '',
	metaDescription: '串聯中原大學台北市校友情誼，提供最新消息、活動資訊與校友會相關服務。',
	metaKeywords: '中原大學,台北市校友會,校友活動,最新消息,校友服務',
	contactLink: 'https://www.facebook.com/TaiBeiShiSiLiZhongYuanDaXueXiaoYouHui?locale=zh_TW',
	taxId: '',
	phone: '',
	fax: '',
	address: '',
	email: '',
	facebookUrl: '',
	instagramUrl: '',
	youtubeUrl: '',
	lineUrl: '',
	copyright: '',
	enquirySubjects: [],
};

function toFormState(data: ApiSiteSettings): SiteSettingsFormState {
	let enquirySubjects: string[] = [];
	try {
		if (data.enquirySubjects) {
			enquirySubjects = JSON.parse(data.enquirySubjects);
		}
	} catch (e) {
		console.error('解析詢問主題失敗:', e);
	}

	return {
		siteName: data.siteName || '',
		siteTitle: data.siteTitle || '',
		logoUrl: data.logoUrl || '',
		footerLogoUrl: data.footerLogoUrl || '',
		faviconUrl: data.faviconUrl || '',
		socialShareImageUrl: data.socialShareImageUrl || '',
		metaDescription: data.metaDescription || '',
		metaKeywords: data.metaKeywords || '',
		contactLink: data.contactLink || '',
		taxId: data.taxId || '',
		phone: data.phone || '',
		fax: data.fax || '',
		address: data.address || '',
		email: data.email || '',
		facebookUrl: data.facebookUrl || '',
		instagramUrl: data.instagramUrl || '',
		youtubeUrl: data.youtubeUrl || '',
		lineUrl: data.lineUrl || '',
		copyright: data.copyright || '',
		enquirySubjects,
	};
}

export default function AdminSiteSettingsPage() {
	const [form, setForm] = useState<SiteSettingsFormState>(defaultFormState);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	useEffect(() => {
		fetchSiteSettings()
			.then((data) => {
				setForm(toFormState(data));
			})
			.catch((error) => {
				console.error('載入網站資訊失敗:', error);
				setNotice({ type: 'error', text: '載入網站資訊失敗，已顯示預設值。' });
				setForm(defaultFormState);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	const handleSave = async (event: React.FormEvent) => {
		event.preventDefault();
		setNotice(null);

		if (!form.siteName.trim()) {
			setNotice({ type: 'error', text: '網站名稱不可為空。' });
			return;
		}

		try {
			setSaving(true);
			const saved = await updateSiteSettings({
				siteName: form.siteName.trim(),
				siteTitle: form.siteTitle.trim() || null,
				logoUrl: form.logoUrl.trim() || null,
				footerLogoUrl: form.footerLogoUrl.trim() || null,
				faviconUrl: form.faviconUrl.trim() || null,
				socialShareImageUrl: form.socialShareImageUrl.trim() || null,
				metaDescription: form.metaDescription.trim() || null,
				metaKeywords: form.metaKeywords.trim() || null,
				contactLink: form.contactLink.trim() || null,
				taxId: form.taxId.trim() || null,
				phone: form.phone.trim() || null,
				fax: form.fax.trim() || null,
				address: form.address.trim() || null,
				email: form.email.trim() || null,
				facebookUrl: form.facebookUrl.trim() || null,
				instagramUrl: form.instagramUrl.trim() || null,
				youtubeUrl: form.youtubeUrl.trim() || null,
				lineUrl: form.lineUrl.trim() || null,
				copyright: form.copyright.trim() || null,
				enquirySubjects: JSON.stringify(form.enquirySubjects),
			});

			setForm(toFormState(saved));
			setNotice({ type: 'success', text: '網站資訊已儲存。' });
		} catch (error) {
			console.error('儲存網站資訊失敗:', error);
			setNotice({ type: 'error', text: '儲存失敗，請稍後再試。' });
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div className='max-w-5xl mx-auto'>
			<form onSubmit={handleSave} className='space-y-6'>
				<div className='flex flex-wrap items-center justify-between gap-4'>
					<div>
						<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>
							網站管理 - 網站資訊
						</h1>
						<p className='text-text-light mt-2'>管理網站名稱、Logo 與 SEO 設定。</p>
					</div>
					<button
						type='submit'
						disabled={saving}
						className='px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60'
					>
						{saving ? '儲存中...' : '儲存'}
					</button>
				</div>

				{notice && (
					<div
						className={`rounded-xl border px-4 py-3 text-sm ${
							notice.type === 'success'
								? 'bg-green-50 text-green-700 border-green-200'
								: 'bg-red-50 text-red-700 border-red-200'
						}`}
					>
						{notice.text}
					</div>
				)}

				<div className='bg-white rounded-xl border border-border p-5 space-y-5'>
					<h2 className='text-lg font-semibold text-text'>基本資訊</h2>

					<div>
						<label htmlFor='siteName' className='block text-base font-semibold text-text mb-1.5'>
							網站名稱 *
						</label>
						<input
							id='siteName'
							type='text'
							value={form.siteName}
							onChange={(event) => setForm((prev) => ({ ...prev, siteName: event.target.value }))}
							className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							required
						/>
					</div>

					<div>
						<label htmlFor='siteTitle' className='block text-base font-semibold text-text mb-1.5'>
							網站標題（title）
						</label>
						<input
							id='siteTitle'
							type='text'
							value={form.siteTitle}
							onChange={(event) => setForm((prev) => ({ ...prev, siteTitle: event.target.value }))}
							className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							placeholder='例如：中原大學台北市校友會 | 校友交流與活動平台'
						/>
					</div>
				</div>

				<div className='bg-white rounded-xl border border-border p-5 space-y-5'>
					<h2 className='text-lg font-semibold text-text'>品牌圖片</h2>

					<div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
						<ImageSelectInput
							label='網站 Logo'
							value={form.logoUrl}
							onChange={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
						/>
						<ImageSelectInput
							label='網站底部 Logo'
							value={form.footerLogoUrl}
							onChange={(url) => setForm((prev) => ({ ...prev, footerLogoUrl: url }))}
						/>
					</div>

					<ImageSelectInput
						label='網站小圖示（Favicon URL）'
						value={form.faviconUrl}
						onChange={(url) => setForm((prev) => ({ ...prev, faviconUrl: url }))}
					/>

					<ImageSelectInput
						label='社群分享圖片（OG Image）'
						value={form.socialShareImageUrl}
						onChange={(url) => setForm((prev) => ({ ...prev, socialShareImageUrl: url }))}
					/>
				</div>

				<div className='bg-white rounded-xl border border-border p-5 space-y-5'>
					<h2 className='text-lg font-semibold text-text'>其他資訊</h2>

					<div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
						<div>
							<label htmlFor='taxId' className='block text-base font-semibold text-text mb-1.5'>
								統一編號
							</label>
							<input
								id='taxId'
								type='text'
								value={form.taxId}
								onChange={(event) => setForm((prev) => ({ ...prev, taxId: event.target.value }))}
								className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							/>
						</div>
						<div>
							<label htmlFor='phone' className='block text-base font-semibold text-text mb-1.5'>
								電話
							</label>
							<input
								id='phone'
								type='text'
								value={form.phone}
								onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
								className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							/>
						</div>
						<div>
							<label htmlFor='fax' className='block text-base font-semibold text-text mb-1.5'>
								傳真
							</label>
							<input
								id='fax'
								type='text'
								value={form.fax}
								onChange={(event) => setForm((prev) => ({ ...prev, fax: event.target.value }))}
								className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							/>
						</div>
						<div>
							<label htmlFor='email' className='block text-base font-semibold text-text mb-1.5'>
								電子郵件
							</label>
							<input
								id='email'
								type='email'
								value={form.email}
								onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
								className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							/>
						</div>
					</div>

					<div>
						<label htmlFor='address' className='block text-base font-semibold text-text mb-1.5'>
							地址
						</label>
						<input
							id='address'
							type='text'
							value={form.address}
							onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
							className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
						/>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2'>
						<div>
							<label
								htmlFor='facebookUrl'
								className='block text-sm font-semibold text-text-light mb-1.5'
							>
								社群連結 (Facebook)
							</label>
							<input
								id='facebookUrl'
								type='text'
								value={form.facebookUrl}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, facebookUrl: event.target.value }))
								}
								className='w-full px-4 py-2 text-sm rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							/>
						</div>
						<div>
							<label
								htmlFor='instagramUrl'
								className='block text-sm font-semibold text-text-light mb-1.5'
							>
								社群連結 (Instagram)
							</label>
							<input
								id='instagramUrl'
								type='text'
								value={form.instagramUrl}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, instagramUrl: event.target.value }))
								}
								className='w-full px-4 py-2 text-sm rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							/>
						</div>
						<div>
							<label
								htmlFor='youtubeUrl'
								className='block text-sm font-semibold text-text-light mb-1.5'
							>
								社群連結 (YouTube)
							</label>
							<input
								id='youtubeUrl'
								type='text'
								value={form.youtubeUrl}
								onChange={(event) =>
									setForm((prev) => ({ ...prev, youtubeUrl: event.target.value }))
								}
								className='w-full px-4 py-2 text-sm rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							/>
						</div>
						<div>
							<label
								htmlFor='lineUrl'
								className='block text-sm font-semibold text-text-light mb-1.5'
							>
								社群連結 (Line)
							</label>
							<input
								id='lineUrl'
								type='text'
								value={form.lineUrl}
								onChange={(event) => setForm((prev) => ({ ...prev, lineUrl: event.target.value }))}
								className='w-full px-4 py-2 text-sm rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							/>
						</div>
					</div>

					<div>
						<label htmlFor='copyright' className='block text-base font-semibold text-text mb-1.5'>
							底部 Copyright
						</label>
						<input
							id='copyright'
							type='text'
							value={form.copyright}
							onChange={(event) => setForm((prev) => ({ ...prev, copyright: event.target.value }))}
							className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							placeholder='例如：© 2026 中原大學台北市校友會. All rights reserved.'
						/>
					</div>

					<div className='pt-4 border-t border-border'>
						<label className='block text-base font-semibold text-text mb-3'>
							聯絡我們 - 詢問主題
						</label>
						<div className='space-y-3'>
							{form.enquirySubjects.map((subject, index) => (
								<div key={index} className='flex gap-2'>
									<input
										type='text'
										value={subject}
										onChange={(e) => {
											const newSubjects = [...form.enquirySubjects];
											newSubjects[index] = e.target.value;
											setForm((prev) => ({ ...prev, enquirySubjects: newSubjects }));
										}}
										className='flex-1 px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
									/>
									<button
										type='button'
										onClick={() => {
											const newSubjects = form.enquirySubjects.filter((_, i) => i !== index);
											setForm((prev) => ({ ...prev, enquirySubjects: newSubjects }));
										}}
										className='px-3 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors'
									>
										刪除
									</button>
								</div>
							))}
							<button
								type='button'
								onClick={() =>
									setForm((prev) => ({
										...prev,
										enquirySubjects: [...prev.enquirySubjects, ''],
									}))
								}
								className='px-4 py-2 text-sm font-semibold bg-surface border border-border rounded-xl hover:bg-gray-50 transition-colors'
							>
								+ 新增主題
							</button>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-xl border border-border p-5 space-y-5'>
					<h2 className='text-lg font-semibold text-text'>聯絡按鈕設定</h2>

					<div>
						<label htmlFor='contactLink' className='block text-base font-semibold text-text mb-1.5'>
							「洽詢此產品」按鈕連結
						</label>
						<input
							id='contactLink'
							type='text'
							value={form.contactLink}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, contactLink: event.target.value }))
							}
							className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							placeholder='例如 mailto:contact@example.com 或 聯絡我們頁面連結'
						/>
						<p className='text-xs text-text-light mt-1.5'>
							此設定將作為產品詳細頁「洽詢此產品」按鈕的預設連結（若產品未設定個別連結時使用）。
							<br />
							若要發送郵件，請輸入 <code>mailto:電子郵件地址</code>
						</p>
					</div>
				</div>

				<div className='bg-white rounded-xl border border-border p-5 space-y-5'>
					<h2 className='text-lg font-semibold text-text'>SEO 設定</h2>

					<div>
						<label
							htmlFor='metaDescription'
							className='block text-base font-semibold text-text mb-1.5'
						>
							搜尋描述（meta description）
						</label>
						<textarea
							id='metaDescription'
							rows={4}
							value={form.metaDescription}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, metaDescription: event.target.value }))
							}
							className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							placeholder='建議 100-200 字內的網站描述'
						/>
					</div>

					<div>
						<label
							htmlFor='metaKeywords'
							className='block text-base font-semibold text-text mb-1.5'
						>
							網站關鍵字（meta keywords）
						</label>
						<textarea
							id='metaKeywords'
							rows={3}
							value={form.metaKeywords}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, metaKeywords: event.target.value }))
							}
							className='w-full px-4 py-2 text-base rounded-xl border border-border bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors'
							placeholder='請使用逗號分隔，例如：中原大學,台北市校友會,校友活動'
						/>
					</div>
				</div>

				<div className='flex justify-end'>
					<button
						type='submit'
						disabled={saving}
						className='px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60'
					>
						{saving ? '儲存中...' : '儲存設定'}
					</button>
				</div>
			</form>
		</div>
	);
}
