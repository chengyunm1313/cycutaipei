'use client';

import { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUsers, deleteUserApi } from '@/lib/api';
import { roleLabels, type Role } from '@/data/types';

/** D1 回傳的使用者（不含密碼） */
interface SafeUser {
	id: number;
	username: string;
	displayName: string;
	role: Role;
	createdAt: string;
}

/**
 * 後台 - 使用者管理列表
 * 從 D1 API 動態載入
 */
export default function AdminUsersPage() {
	const { hasPermission, currentUser } = useAuth();
	const router = useRouter();
	const [users, setUsers] = useState<SafeUser[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!hasPermission('users')) {
			router.replace('/admin');
			return;
		}
		fetchUsers()
			.then((data) => setUsers(data as SafeUser[]))
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [hasPermission, router]);

	const handleDelete = async (id: number) => {
		if (id === currentUser?.id) {
			alert('無法刪除自己的帳號');
			return;
		}
		if (!confirm('確定要刪除此使用者嗎？')) return;
		try {
			await deleteUserApi(id);
			setUsers((prev) => prev.filter((u) => u.id !== id));
		} catch (err) {
			console.error(err);
			alert('刪除失敗');
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
		<div>
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h1 className='text-2xl font-bold text-text'>使用者管理</h1>
					<p className='text-text-muted text-sm mt-1'>管理後台使用者帳號與角色</p>
				</div>
				<AppLink
					href='/admin/users/new'
					className='inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer'
				>
					<svg
						className='w-4 h-4'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={2}
						stroke='currentColor'
					>
						<path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
					</svg>
					新增使用者
				</AppLink>
			</div>

			<div className='bg-card rounded-xl border border-border overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead>
							<tr className='bg-surface-alt text-left'>
								<th className='px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider'>
									帳號
								</th>
								<th className='px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider'>
									顯示名稱
								</th>
								<th className='px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider'>
									角色
								</th>
								<th className='px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider'>
									建立日期
								</th>
								<th className='px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right'>
									操作
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{users.map((user) => (
								<tr key={user.id} className='hover:bg-surface/50 transition-colors duration-150'>
									<td className='px-5 py-4'>
										<div className='flex items-center gap-3'>
											<div className='w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold'>
												{user.displayName.charAt(0)}
											</div>
											<span className='text-sm font-medium text-text'>{user.username}</span>
										</div>
									</td>
									<td className='px-5 py-4 text-sm text-text-muted'>{user.displayName}</td>
									<td className='px-5 py-4'>
										<span
											className={`text-xs px-2.5 py-1 rounded-full font-medium ${
												user.role === 'admin'
													? 'bg-error/10 text-error'
													: user.role === 'editor'
														? 'bg-primary/10 text-primary'
														: user.role === 'author'
															? 'bg-success/10 text-success'
															: 'bg-surface text-text-muted'
											}`}
										>
											{roleLabels[user.role]}
										</span>
									</td>
									<td className='px-5 py-4 text-sm text-text-muted'>
										{new Date(user.createdAt).toLocaleDateString('zh-TW')}
									</td>
									<td className='px-5 py-4 text-right flex justify-end gap-2'>
										<AppLink
											href={`/admin/users/${user.id}`}
											className='p-1.5 rounded-lg hover:bg-primary/10 transition-colors duration-200 cursor-pointer'
											title='編輯'
										>
											<svg
												className='w-4 h-4 text-primary'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth={2}
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125'
												/>
											</svg>
										</AppLink>
										{user.id !== currentUser?.id && (
											<button
												onClick={() => handleDelete(user.id)}
												className='p-1.5 rounded-lg hover:bg-error/10 transition-colors duration-200 cursor-pointer'
												title='刪除'
											>
												<svg
													className='w-4 h-4 text-error'
													fill='none'
													viewBox='0 0 24 24'
													strokeWidth={2}
													stroke='currentColor'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
													/>
												</svg>
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
