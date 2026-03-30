import AppLink from '@/components/AppLink';

interface BreadcrumbItem {
	label: string;
	href?: string;
}

/**
 * 麵包屑導覽元件
 */
export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
	return (
		<nav aria-label='麵包屑導覽' className='mb-6'>
			<ol className='flex items-center flex-wrap gap-1.5 text-sm'>
				<li>
					<AppLink
						href='/'
						className='text-text-muted hover:text-primary transition-colors duration-200 cursor-pointer'
					>
						首頁
					</AppLink>
				</li>
				{items.map((item, index) => (
					<li key={index} className='flex items-center gap-1.5'>
						<svg
							className='w-4 h-4 text-text-light'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={2}
							stroke='currentColor'
						>
							<path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
						</svg>
						{item.href ? (
							<AppLink
								href={item.href}
								className='text-text-muted hover:text-primary transition-colors duration-200 cursor-pointer'
							>
								{item.label}
							</AppLink>
						) : (
							<span className='text-text font-medium'>{item.label}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
