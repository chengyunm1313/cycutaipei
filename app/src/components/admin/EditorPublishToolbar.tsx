'use client';

import type { ReactNode } from 'react';
import AppLink from '@/components/AppLink';

type EditorStatus = 'draft' | 'published';
type SubmitAction = EditorStatus | null;

type EditorPublishToolbarProps = {
	backHref: string;
	title: string;
	status: EditorStatus;
	onSaveDraft: () => void;
	onPublish: () => void;
	isSubmitting: boolean;
	submittingAction: SubmitAction;
	meta?: ReactNode;
	extraActions?: ReactNode;
};

const STATUS_STYLES: Record<EditorStatus, string> = {
	draft: 'bg-surface text-text-muted border border-border',
	published: 'bg-success/10 text-success border border-success/20',
};

const STATUS_LABELS: Record<EditorStatus, string> = {
	draft: '草稿',
	published: '已發布',
};

export default function EditorPublishToolbar({
	backHref,
	title,
	status,
	onSaveDraft,
	onPublish,
	isSubmitting,
	submittingAction,
	meta,
	extraActions,
}: EditorPublishToolbarProps) {
	return (
		<div className='sticky top-4 z-20 mb-6 rounded-2xl border border-border bg-card/95 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:px-6'>
			<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
				<div className='min-w-0'>
					<div className='flex flex-wrap items-center gap-3'>
						<AppLink
							href={backHref}
							className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-muted transition-colors duration-200 hover:bg-surface-alt'
						>
							<svg
								className='h-5 w-5'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
								/>
							</svg>
						</AppLink>
						<div className='min-w-0'>
							<div className='flex flex-wrap items-center gap-3'>
								<h1 className='truncate text-xl font-bold text-text'>{title}</h1>
								<span
									className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
								>
									{STATUS_LABELS[status]}
								</span>
							</div>
							{meta ? <div className='mt-1 text-sm text-text-light'>{meta}</div> : null}
						</div>
					</div>
				</div>

				<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end'>
					{extraActions}
					<button
						type='button'
						onClick={onSaveDraft}
						disabled={isSubmitting}
						className='inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-muted transition-colors duration-200 hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50'
					>
						{isSubmitting && submittingAction === 'draft' ? '儲存中...' : '儲存草稿'}
					</button>
					<button
						type='button'
						onClick={onPublish}
						disabled={isSubmitting}
						className='inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50'
					>
						{isSubmitting && submittingAction === 'published' ? '發布中...' : '發布'}
					</button>
				</div>
			</div>
		</div>
	);
}
