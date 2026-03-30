'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

type NextLinkProps = ComponentProps<typeof Link>;

const LINK_PREFETCH_ENABLED = process.env.NEXT_PUBLIC_LINK_PREFETCH_ENABLED === 'true';

/**
 * 共用導頁元件：預設關閉 prefetch，降低 App Router 的 RSC 預抓請求噪音。
 * 可用 NEXT_PUBLIC_LINK_PREFETCH_ENABLED=true 全域重新開啟預抓。
 */
export default function AppLink({ prefetch, ...props }: NextLinkProps) {
	const resolvedPrefetch = prefetch ?? LINK_PREFETCH_ENABLED;
	return <Link {...props} prefetch={resolvedPrefetch} />;
}
