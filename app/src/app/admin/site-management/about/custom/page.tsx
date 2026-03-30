'use client';

import AppLink from '@/components/AppLink';
import { useEffect, useState } from 'react';
import { fetchSiteContents } from '@/lib/api';
import type { ApiSiteContent } from '@/data/types';

export default function AdminAboutCustomListPage() {
	const [pages, setPages] = useState<ApiSiteContent[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchSiteContents({ type: 'about_page' })
			.then(setPages)
			.catch((error) => {
				console.error('載入關於我們頁面失敗:', error);
			})
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <div className='p-8 text-center text-text-muted'>載入中...</div>;
	}

	return (
		<div className='max-w-4xl mx-auto space-y-4'>
			<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>網站管理 - 關於我們 / 自訂義頁面</h1>
			<div className='bg-white rounded-xl border border-border divide-y divide-border'>
				{pages.map((item) => (
					<AppLink
						key={item.id}
						href={`/admin/site-management/about/${item.id}`}
						className='flex items-center justify-between px-5 py-3 hover:bg-surface/60 transition-colors'
					>
						<div>
							<p className='font-semibold text-text'>{item.title || '未命名頁面'}</p>
							<p className='text-sm text-text-muted'>/{item.slug || 'no-slug'}</p>
						</div>
						<span className='text-primary text-sm font-medium'>前往編輯</span>
					</AppLink>
				))}
				{pages.length === 0 && (
					<div className='px-5 py-10 text-center text-text-light'>
						目前沒有可編輯頁面，請先到管理頁面建立。
					</div>
				)}
			</div>
		</div>
	);
}
