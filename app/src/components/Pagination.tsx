/**
 * 分頁元件
 */
export default function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	if (totalPages <= 1) return null;

	const getPages = () => {
		const pages: (number | '...')[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);
			if (currentPage > 3) pages.push('...');
			for (
				let i = Math.max(2, currentPage - 1);
				i <= Math.min(totalPages - 1, currentPage + 1);
				i++
			) {
				pages.push(i);
			}
			if (currentPage < totalPages - 2) pages.push('...');
			pages.push(totalPages);
		}
		return pages;
	};

	return (
		<nav aria-label='分頁導覽' className='flex items-center justify-center gap-1.5 mt-8'>
			{/* 上一頁 */}
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className='p-2 rounded-lg border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200'
				aria-label='上一頁'
			>
				<svg
					className='w-4 h-4 text-text'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth={2}
					stroke='currentColor'
				>
					<path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
				</svg>
			</button>

			{/* 頁碼 */}
			{getPages().map((page, idx) =>
				page === '...' ? (
					<span
						key={`ellipsis-${idx}`}
						className='w-9 h-9 flex items-center justify-center text-sm text-text-light'
					>
						...
					</span>
				) : (
					<button
						key={page}
						onClick={() => onPageChange(page)}
						className={`w-9 h-9 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 ${
							page === currentPage
								? 'bg-primary text-white'
								: 'text-text-muted hover:bg-surface border border-border'
						}`}
					>
						{page}
					</button>
				)
			)}

			{/* 下一頁 */}
			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className='p-2 rounded-lg border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200'
				aria-label='下一頁'
			>
				<svg
					className='w-4 h-4 text-text'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth={2}
					stroke='currentColor'
				>
					<path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
				</svg>
			</button>
		</nav>
	);
}
