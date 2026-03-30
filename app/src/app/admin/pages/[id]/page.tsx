'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPage } from '@/lib/api';
import type { ApiPage } from '@/data/types';
import PageForm from '@/components/admin/PageForm';

export const runtime = 'edge';

export default function EditPage() {
	const params = useParams();
	const router = useRouter();
	const idStr = params.id as string;
	const id = parseInt(idStr, 10);

	const [page, setPage] = useState<ApiPage | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;

		fetchPage(id)
			.then((data) => {
				setPage(data);
			})
			.catch((err) => {
				console.error('Failed to fetch page', err);
				alert('找不到該頁面');
				router.push('/admin/pages');
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id, router]);

	if (loading) {
		return <div className='p-8 text-center text-text-muted'>載入中...</div>;
	}

	if (!page) {
		return null; // or handled by catch block
	}

	return <PageForm initialData={page} />;
}
