'use client';

interface AdminPaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	totalItems: number;
	itemsPerPage: number;
}

export function AdminPagination({
	currentPage,
	totalPages,
	onPageChange,
	totalItems,
	itemsPerPage,
}: AdminPaginationProps) {
	if (totalPages <= 1) return null;

	// 生成要顯示的頁碼陣列（簡化版：最多顯示 5 個數字，外加前後省略號）
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			if (currentPage <= 4) {
				pages.push(1, 2, 3, 4, 5, '...', totalPages);
			} else if (currentPage >= totalPages - 3) {
				pages.push(
					1,
					'...',
					totalPages - 4,
					totalPages - 3,
					totalPages - 2,
					totalPages - 1,
					totalPages
				);
			} else {
				pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
			}
		}
		return pages;
	};

	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	return (
		<div className='flex items-center justify-between px-5 py-3 border-t border-border bg-surface-alt'>
			<div className='flex-1 flex justify-between sm:hidden'>
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className='relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text bg-white hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed'
				>
					上一頁
				</button>
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className='ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text bg-white hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed'
				>
					下一頁
				</button>
			</div>
			<div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
				<div>
					<p className='text-sm text-text-muted'>
						顯示第 <span className='font-medium text-text'>{startItem}</span> 到{' '}
						<span className='font-medium text-text'>{endItem}</span> 筆，共{' '}
						<span className='font-medium text-text'>{totalItems}</span> 筆資料
					</p>
				</div>
				<div>
					<nav
						className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
						aria-label='Pagination'
					>
						<button
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-white text-sm font-medium text-text-muted hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed'
						>
							<span className='sr-only'>上一頁</span>
							<svg
								className='h-5 w-5'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								aria-hidden='true'
							>
								<path
									fillRule='evenodd'
									d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
									clipRule='evenodd'
								/>
							</svg>
						</button>
						{getPageNumbers().map((page, index) => (
							<button
								key={index}
								onClick={() => typeof page === 'number' && onPageChange(page)}
								disabled={typeof page === 'string'}
								className={`relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium ${
									page === currentPage
										? 'z-10 bg-primary text-white border-primary'
										: typeof page === 'string'
											? 'bg-white text-text-muted cursor-default'
											: 'bg-white text-text-muted hover:bg-surface'
								}`}
							>
								{page}
							</button>
						))}
						<button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-white text-sm font-medium text-text-muted hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed'
						>
							<span className='sr-only'>下一頁</span>
							<svg
								className='h-5 w-5'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'
								aria-hidden='true'
							>
								<path
									fillRule='evenodd'
									d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
									clipRule='evenodd'
								/>
							</svg>
						</button>
					</nav>
				</div>
			</div>
		</div>
	);
}

export interface SortConfig<T> {
	key: keyof T | null;
	direction: 'asc' | 'desc';
}

interface SortableHeaderProps<T> {
	label: string;
	sortKey: keyof T;
	sortConfig: SortConfig<T>;
	onSort: (key: keyof T) => void;
	align?: 'left' | 'center' | 'right';
}

export function SortableHeader<T>({
	label,
	sortKey,
	sortConfig,
	onSort,
	align = 'left',
}: SortableHeaderProps<T>) {
	const isActive = sortConfig.key === sortKey;

	return (
		<th
			className={`px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:bg-surface-alt/80 select-none ${
				align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
			}`}
			onClick={() => onSort(sortKey)}
		>
			<div
				className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}
			>
				{label}
				<span className='flex flex-col text-[10px] w-2'>
					<svg
						className={`h-2.5 w-2.5 -mb-1 ${isActive && sortConfig.direction === 'asc' ? 'text-primary' : 'text-text-muted opacity-40'}`}
						fill='currentColor'
						viewBox='0 0 20 20'
					>
						<path
							fillRule='evenodd'
							d='M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z'
							clipRule='evenodd'
						/>
					</svg>
					<svg
						className={`h-2.5 w-2.5 ${isActive && sortConfig.direction === 'desc' ? 'text-primary' : 'text-text-muted opacity-40'}`}
						fill='currentColor'
						viewBox='0 0 20 20'
					>
						<path
							fillRule='evenodd'
							d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
							clipRule='evenodd'
						/>
					</svg>
				</span>
			</div>
		</th>
	);
}
