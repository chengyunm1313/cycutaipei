'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ImageSelectInput from '@/components/ImageSelectInput';
import { fetchSiteContent, updateSiteContent } from '@/lib/api';

const BlockNoteEditor = dynamic(() => import('@/components/BlockNoteEditorWrapper'), {
	ssr: false,
});

interface AboutExtras {
	image2?: string;
	image3?: string;
}

function notifySiteContentUpdated() {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new Event('site-content-updated'));
	}
}

export default function AdminAboutCustomEditPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [notice, setNotice] = useState('');

	const [title, setTitle] = useState('');
	const [summary, setSummary] = useState('');
	const [slug, setSlug] = useState('');
	const [linkUrl, setLinkUrl] = useState('');
	const [image1, setImage1] = useState('');
	const [image2, setImage2] = useState('');
	const [image3, setImage3] = useState('');
	const [content, setContent] = useState('<p>請輸入內容</p>');

	useEffect(() => {
		if (!id) return;
		fetchSiteContent(id)
			.then((item) => {
				if (item.type !== 'about_page') {
					alert('這不是關於我們頁面');
					router.push('/admin/site-management/about');
					return;
				}

				let extras: AboutExtras = {};
				if (item.extraJson) {
					try {
						extras = JSON.parse(item.extraJson) as AboutExtras;
					} catch {
						extras = {};
					}
				}

				setTitle(item.title || '');
				setSummary(item.summary || '');
				setSlug(item.slug || '');
				setLinkUrl(item.linkUrl || '');
				setImage1(item.imageUrl || '');
				setImage2(extras.image2 || '');
				setImage3(extras.image3 || '');
				setContent(item.content || '<p>請輸入內容</p>');
			})
			.catch((error) => {
				console.error('載入關於我們自訂頁失敗:', error);
				alert('載入失敗');
				router.push('/admin/site-management/about');
			})
			.finally(() => setLoading(false));
	}, [id, router]);

	const handleSave = async () => {
		setNotice('');
		if (!title.trim()) {
			setNotice('請填寫顯示標題。');
			return;
		}

		try {
			setSaving(true);
			await updateSiteContent(id, {
				title: title.trim(),
				summary: summary.trim() || null,
				slug: slug.trim() || null,
				linkUrl: linkUrl.trim() || null,
				imageUrl: image1.trim() || null,
				content,
				extraJson: JSON.stringify({ image2: image2.trim(), image3: image3.trim() }),
			});
			setNotice('儲存成功。');
			notifySiteContentUpdated();
		} catch (error) {
			console.error('儲存關於我們自訂頁失敗:', error);
			setNotice('儲存失敗，請稍後再試。');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div className='p-8 text-center text-text-muted'>載入中...</div>;
	}

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>
					網站管理 - 關於我們 / 自訂義頁面
				</h1>
				<div className='flex gap-2'>
					<button
						onClick={() => router.push('/admin/site-management/about')}
						className='px-4 py-2 rounded-xl border border-border text-sm font-semibold'
					>
						返回管理頁面
					</button>
					<button
						onClick={handleSave}
						disabled={saving}
						className='px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60'
					>
						{saving ? '儲存中...' : '儲存'}
					</button>
				</div>
			</div>

			{notice && (
				<div className='px-4 py-3 rounded-xl border border-border bg-surface text-sm'>{notice}</div>
			)}

			<div className='bg-white rounded-xl border border-border p-5 space-y-5'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<label className='block text-base font-semibold text-text mb-1.5'>顯示標題</label>
						<input
							type='text'
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
						/>
					</div>
					<div>
						<label className='block text-base font-semibold text-text mb-1.5'>Slug</label>
						<input
							type='text'
							value={slug}
							onChange={(event) => setSlug(event.target.value)}
							className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface font-mono'
						/>
					</div>
				</div>

				<div>
					<label className='block text-base font-semibold text-text mb-1.5'>副標題/摘要</label>
					<input
						type='text'
						value={summary}
						onChange={(event) => setSummary(event.target.value)}
						className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
					/>
				</div>

				<div>
					<label className='block text-base font-semibold text-text mb-1.5'>More 前往連結</label>
					<input
						type='url'
						value={linkUrl}
						onChange={(event) => setLinkUrl(event.target.value)}
						className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
						placeholder='https://example.com/about'
					/>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
					<ImageSelectInput label='圖片 或 youtube #1' value={image1} onChange={setImage1} />
					<ImageSelectInput label='圖片 或 youtube #2' value={image2} onChange={setImage2} />
					<ImageSelectInput label='圖片 或 youtube #3' value={image3} onChange={setImage3} />
				</div>

				<div>
					<label className='block text-base font-semibold text-text mb-1.5'>內文</label>
					<div className='border border-border rounded-xl overflow-hidden bg-white'>
						<BlockNoteEditor initialHTML={content} onChange={setContent} />
					</div>
				</div>
			</div>
		</div>
	);
}
