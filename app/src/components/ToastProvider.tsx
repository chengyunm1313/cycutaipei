'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
	showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

	const showToast = (message: string, type: ToastType = 'success') => {
		const id = Date.now();
		setToast({ message, type, id });
		setTimeout(() => {
			setToast((prev) => (prev?.id === id ? null : prev));
		}, 3000);
	};

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			{toast && (
				<div className='fixed bottom-6 right-6 z-50 animate-fade-in'>
					<div
						className={`px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium text-white shadow-black/10 backdrop-blur-md
            ${toast.type === 'success' ? 'bg-green-600/95' : ''}
            ${toast.type === 'error' ? 'bg-red-600/95' : ''}
            ${toast.type === 'info' ? 'bg-blue-600/95' : ''}
          `}
					>
						{toast.type === 'success' && (
							<svg
								className='w-5 h-5'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path strokeLinecap='round' strokeLinejoin='round' d='M4.5 12.75l6 6 9-13.5' />
							</svg>
						)}
						{toast.type === 'error' && (
							<svg
								className='w-5 h-5'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
								/>
							</svg>
						)}
						{toast.type === 'info' && (
							<svg
								className='w-5 h-5'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
								/>
							</svg>
						)}
						{toast.message}
					</div>
				</div>
			)}
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) throw new Error('useToast must be used within ToastProvider');
	return context;
}
