'use client';

export const runtime = 'edge';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUser, updateUserApi } from '@/lib/api';
import { roleLabels, type Role, type ApiUser } from '@/data/types';
import ImageSelectInput from '@/components/ImageSelectInput';

const roles: Role[] = ['admin', 'editor', 'author', 'viewer'];
type UserUpdatePayload = Partial<ApiUser> & { password?: string };

/**
 * 後台 - 編輯使用者
 */
export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const { hasPermission } = useAuth();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState(''); // 留白表示不修改
	const [displayName, setDisplayName] = useState('');
	const [role, setRole] = useState<Role>('viewer');
	const [notes, setNotes] = useState('');
	const [photoUrl, setPhotoUrl] = useState('');
	const [aboutAuthor, setAboutAuthor] = useState('');

	// Social links
	const [blogLink, setBlogLink] = useState('');
	const [facebookLink, setFacebookLink] = useState('');
	const [instagramLink, setInstagramLink] = useState('');
	const [youtubeLink, setYoutubeLink] = useState('');
	const [githubLink, setGithubLink] = useState('');

	useEffect(() => {
		if (!hasPermission('users')) {
			router.replace('/admin');
			return;
		}

		fetchUser(parseInt(resolvedParams.id, 10))
			.then((user: ApiUser) => {
				setUsername(user.username);
				setDisplayName(user.displayName);
				setRole((user.role as Role) || 'viewer');
				setNotes(user.notes || '');
				setPhotoUrl(user.photoUrl || '');
				setAboutAuthor(user.aboutAuthor || '');

				if (user.socialLinks) {
					try {
						const links = JSON.parse(user.socialLinks);
						setBlogLink(links.blog || '');
						setFacebookLink(links.facebook || '');
						setInstagramLink(links.instagram || '');
						setYoutubeLink(links.youtube || '');
						setGithubLink(links.github || '');
					} catch (e) {
						console.error('Failed to parse social links', e);
					}
				}
			})
			.catch((err) => {
				console.error(err);
				setError('無法載入使用者資料');
			})
			.finally(() => setLoading(false));
	}, [hasPermission, router, resolvedParams.id]);

	const generatePassword = () => {
		const length = 12;
		const charset =
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
		let retVal = '';
		for (let i = 0, n = charset.length; i < length; ++i) {
			retVal += charset.charAt(Math.floor(Math.random() * n));
		}
		setPassword(retVal);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!username || !displayName) {
			setError('請填寫所有必填欄位');
			return;
		}

		const socialLinks = JSON.stringify({
			blog: blogLink,
			facebook: facebookLink,
			instagram: instagramLink,
			youtube: youtubeLink,
			github: githubLink,
		});

		try {
			const updateData: UserUpdatePayload = {
				username,
				displayName,
				role,
				notes,
				photoUrl,
				aboutAuthor,
				socialLinks,
			};
			if (password) {
				updateData.password = password;
			}

			await updateUserApi(parseInt(resolvedParams.id, 10), updateData);
			alert('使用者已更新！');
			router.push('/admin/users');
		} catch (err) {
			setError(err instanceof Error ? err.message : '更新失敗');
		}
	};

	if (!hasPermission('users')) return null;

	if (loading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div className='max-w-4xl'>
			<div className='flex items-center gap-3 mb-6'>
				<AppLink
					href='/admin/users'
					className='p-2 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
				>
					<svg
						className='w-5 h-5 text-text-muted'
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
				<h1 className='text-2xl font-bold text-text'>編輯使用者</h1>
			</div>

			<div className='bg-card rounded-xl border border-border p-6'>
				<div className='mb-6 bg-primary/10 text-primary px-4 py-3 rounded-lg flex items-center gap-2'>
					<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
						/>
					</svg>
					<span className='text-sm font-medium'>管理者若非文章作者，欄位留白即可。</span>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{error && (
						<div className='bg-error/10 text-error text-sm px-4 py-2.5 rounded-lg'>{error}</div>
					)}

					<div className='space-y-6'>
						{/* 帳號 */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6'>
							<div className='md:col-span-1 font-medium text-text md:text-right pt-2.5'>帳號：</div>
							<div className='md:col-span-3'>
								<input
									type='text'
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder='填寫email 或登入帳號'
									required
									className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
								/>
							</div>
						</div>

						{/* 姓名 */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6'>
							<div className='md:col-span-1 font-medium text-text md:text-right pt-2.5'>姓名：</div>
							<div className='md:col-span-3'>
								<input
									type='text'
									value={displayName}
									onChange={(e) => setDisplayName(e.target.value)}
									placeholder='顯示姓名'
									required
									className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
								/>
								<p className='text-xs text-text-light mt-1.5'>文章作者公開名稱</p>
							</div>
						</div>

						{/* 角色 */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6'>
							<div className='md:col-span-1 font-medium text-text md:text-right pt-2.5'>角色：</div>
							<div className='md:col-span-3'>
								<select
									value={role}
									onChange={(e) => setRole(e.target.value as Role)}
									className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
								>
									{roles.map((r) => (
										<option key={r} value={r}>
											{roleLabels[r]}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* 密碼 */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6'>
							<div className='md:col-span-1 font-medium text-text md:text-right pt-2.5 flex justify-start md:justify-end items-start'>
								密碼：
							</div>
							<div className='md:col-span-3'>
								<input
									type='text'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder='若不修改密碼請留白'
									className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
								/>
								<button
									type='button'
									onClick={generatePassword}
									className='text-primary text-sm font-medium mt-2 hover:underline cursor-pointer text-left block'
								>
									Generate Password
								</button>
								<p className='text-xs text-text-light mt-1.5 leading-relaxed'>
									(本教學網密碼都經過雜湊處理，管理者也無法得知使用者密碼，敬請安心使用)
								</p>
							</div>
						</div>

						{/* 備註 */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6'>
							<div className='md:col-span-1 font-medium text-text md:text-right pt-2.5'>備註：</div>
							<div className='md:col-span-3'>
								<textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder='輸入備註...'
									className='w-full h-32 px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 resize-none'
								/>
							</div>
						</div>

						{/* 照片 */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6'>
							<div className='md:col-span-1 font-medium text-text md:text-right pt-2.5'>照片：</div>
							<div className='md:col-span-3'>
								<div className='mb-2'>
									<ImageSelectInput value={photoUrl} onChange={setPhotoUrl} />
								</div>
								<p className='text-xs text-text-light mt-1'>(建議圖片比例為正方形)</p>
							</div>
						</div>

						{/* 關於作者 */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6'>
							<div className='md:col-span-1 font-medium text-text md:text-right pt-2.5'>
								關於作者：
							</div>
							<div className='md:col-span-3'>
								<textarea
									value={aboutAuthor}
									onChange={(e) => setAboutAuthor(e.target.value)}
									className='w-full h-40 px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 resize-none'
								/>
								<p className='text-xs text-text-light mt-1.5'>
									(部落格文章作者的介紹，可寫入 html 碼)
								</p>
							</div>
						</div>

						{/* 社群媒體 */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6'>
							<div className='md:col-span-1 font-medium text-text md:text-right pt-2.5'>
								社群媒體：
							</div>
							<div className='md:col-span-3 space-y-4'>
								<div>
									<input
										type='text'
										value={blogLink}
										onChange={(e) => setBlogLink(e.target.value)}
										placeholder='填寫個人連結'
										className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
									/>
									<p className='text-xs text-text-light mt-1.5'>blog 文章發佈者的連結</p>
								</div>
								<div>
									<input
										type='text'
										value={facebookLink}
										onChange={(e) => setFacebookLink(e.target.value)}
										placeholder='填寫 facebook 連結'
										className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
									/>
								</div>
								<div>
									<input
										type='text'
										value={instagramLink}
										onChange={(e) => setInstagramLink(e.target.value)}
										placeholder='填寫 instagram 連結'
										className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
									/>
								</div>
								<div>
									<input
										type='text'
										value={youtubeLink}
										onChange={(e) => setYoutubeLink(e.target.value)}
										placeholder='填寫 youtube 連結'
										className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
									/>
								</div>
								<div>
									<input
										type='text'
										value={githubLink}
										onChange={(e) => setGithubLink(e.target.value)}
										placeholder='填寫 github 連結'
										className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
									/>
								</div>
							</div>
						</div>
					</div>

					{/* 底部按鈕區 */}
					<div className='flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border'>
						<AppLink
							href='/admin/users'
							className='w-32 py-2.5 text-center text-sm font-medium text-text-muted bg-surface border border-border rounded-lg hover:bg-surface-alt transition-colors duration-200 cursor-pointer'
						>
							取消
						</AppLink>
						<button
							type='submit'
							className='w-32 py-2.5 text-center text-sm font-medium text-white bg-[#3b82f6] hover:bg-blue-600 rounded-lg transition-colors duration-200 cursor-pointer'
						>
							送出
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
