'use client';

import { useState, useEffect } from 'react';

/**
 * 客戶端渲染的年份組件，用於解決 SSR/CSR Hydration 不一致問題 (Error #418)
 */
export default function CurrentYear({ defaultYear }: { defaultYear?: number }) {
	const [year, setYear] = useState<number | string>(defaultYear || '...');

	useEffect(() => {
		setYear(new Date().getFullYear());
	}, []);

	return <>{year}</>;
}
