'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 後台 - 登入頁面
 * 預設帳號：admin / 密碼：123456
 */
export default function AdminLoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { login } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const success = await login(username, password);
			if (success) {
				router.push('/admin');
			} else {
				setError('帳號或密碼錯誤');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-surface p-4'>
			<div className='w-full max-w-sm'>
				{/* Logo */}
				<div className='text-center mb-8'>
					<div className='w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4'>
						<svg
							className='w-8 h-8 text-white'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={2}
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75'
							/>
						</svg>
					</div>
					<h1 className='text-xl font-bold text-text'>CMS 管理後台</h1>
					<p className='text-sm text-text-muted mt-1'>請登入以管理產品型錄</p>
				</div>

				{/* 表單 */}
				<div className='bg-card rounded-2xl border border-border p-6 shadow-sm'>
					<form onSubmit={handleSubmit} className='space-y-4'>
						{error && (
							<div className='bg-error/10 text-error text-sm px-4 py-2.5 rounded-lg'>{error}</div>
						)}

						<div>
							<label htmlFor='username' className='block text-sm font-medium text-text mb-1.5'>
								帳號
							</label>
							<input
								id='username'
								type='text'
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder='admin'
								required
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>

						<div>
							<label htmlFor='password' className='block text-sm font-medium text-text mb-1.5'>
								密碼
							</label>
							<input
								id='password'
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder='••••••••'
								required
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>

						<button
							type='submit'
							className='w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer'
						>
							登入
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
