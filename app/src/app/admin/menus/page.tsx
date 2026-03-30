'use client';

import { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { fetchMenus, deleteMenuApi, updateMenuOrderApi } from '@/lib/api';
import type { ApiMenu } from '@/data/types';

export default function AdminMenusPage() {
	const [menus, setMenus] = useState<ApiMenu[]>([]);

	const loadMenus = async () => {
		try {
			const data = await fetchMenus();
			setMenus(data);
		} catch (error) {
			console.error('Error fetching menus:', error);
			alert('無法載入選單列表');
		}
	};

	useEffect(() => {
		let isCancelled = false;
		fetchMenus()
			.then((data) => {
				if (!isCancelled) setMenus(data);
			})
			.catch((error) => {
				console.error('Error fetching menus:', error);
				if (!isCancelled) alert('無法載入選單列表');
			});
		return () => {
			isCancelled = true;
		};
	}, []);

	const handleDelete = async (id: number) => {
		if (!confirm('確定要刪除這個選單嗎？')) return;
		try {
			await deleteMenuApi(id);
			setMenus((menus) => menus.filter((m) => m.id !== id));
			alert('選單已刪除');
		} catch (error) {
			console.error('Error deleting menu:', error);
			alert('刪除失敗');
		}
	};

	const onDragEnd = async (result: DropResult) => {
		if (!result.destination) return;

		const sourceIndex = result.source.index;
		const destinationIndex = result.destination.index;

		if (sourceIndex === destinationIndex) return;

		const newMenus = Array.from(menus);
		const [movedItem] = newMenus.splice(sourceIndex, 1);
		newMenus.splice(destinationIndex, 0, movedItem);

		setMenus(newMenus);

		const updates = newMenus.map((m, index) => ({
			id: m.id,
			order: index,
		}));

		try {
			await updateMenuOrderApi(updates);
		} catch (err) {
			console.error('Error updating order:', err);
			alert('排序更新失敗，請重試');
			void loadMenus(); // 回復原狀
		}
	};

	const getMenuTypeLabel = (type: string) => {
		switch (type) {
			case 'system':
				return '系統內建';
			case 'category_dropdown':
				return '分類下拉選單';
			case 'page':
				return '自訂頁面';
			case 'link':
				return '外部連結';
			default:
				return type;
		}
	};

	if (typeof window === 'undefined') {
		return null; // 避免 SSR hydration mismatch with dnd
	}

	return (
		<div className='p-6 max-w-5xl mx-auto'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold'>導覽列選單管理</h1>
				<AppLink
					href='/admin/menus/new'
					className='px-4 py-2 bg-primary text-text-light rounded-md hover:bg-opacity-90'
				>
					新增選單節點
				</AppLink>
			</div>

			<div className='bg-primary/5 rounded-lg border border-border overflow-hidden'>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId='menus-list'>
						{(provided) => (
							<div {...provided.droppableProps} ref={provided.innerRef} className='flex flex-col'>
								{/* 表頭模擬 */}
								<div className='grid grid-cols-12 gap-4 px-5 py-3 bg-secondary border-b border-border text-xs font-semibold uppercase tracking-wider text-text-muted'>
									<div className='col-span-1'>拖動</div>
									<div className='col-span-3'>標題</div>
									<div className='col-span-2'>類型</div>
									<div className='col-span-3'>URL / 目標</div>
									<div className='col-span-1'>狀態</div>
									<div className='col-span-2 text-right'>操作</div>
								</div>

								{menus.length === 0 ? (
									<div className='px-5 py-12 text-center text-text-light text-sm'>沒有任何選單</div>
								) : (
									menus.map((menu, index) => (
										<Draggable
											key={menu.id.toString()}
											draggableId={menu.id.toString()}
											index={index}
										>
											{(provided, snapshot) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													className={`grid grid-cols-12 gap-4 px-5 py-3 border-b border-border items-center ${
														snapshot.isDragging
															? 'bg-primary/10 shadow-lg'
															: 'bg-surface hover:bg-secondary/50'
													}`}
												>
													<div
														className='col-span-1 cursor-grab active:cursor-grabbing text-text-muted'
														{...provided.dragHandleProps}
													>
														<svg
															className='w-5 h-5'
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth='2'
																d='M4 6h16M4 12h16M4 18h16'
															/>
														</svg>
													</div>
													<div className='col-span-3 font-medium'>{menu.title}</div>
													<div className='col-span-2 text-sm text-text-muted'>
														<span className='px-2 py-1 bg-secondary rounded text-xs'>
															{getMenuTypeLabel(menu.type)}
														</span>
													</div>
													<div className='col-span-3 text-sm text-text-muted truncate'>
														{menu.url || '-'} {menu.target === '_blank' ? '(新視窗)' : ''}
													</div>
													<div className='col-span-1'>
														{menu.isActive ? (
															<span className='inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-700 border border-green-200/50 uppercase tracking-wider'>
																顯示中
															</span>
														) : (
															<span className='inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-700 border border-red-200/50 uppercase tracking-wider'>
																隱藏
															</span>
														)}
													</div>
													<div className='col-span-2 text-right text-sm font-medium'>
														<AppLink
															href={`/admin/menus/${menu.id}`}
															className='text-primary hover:text-opacity-80 mr-4'
														>
															編輯
														</AppLink>
														<button
															onClick={() => handleDelete(menu.id)}
															className='text-red-500 hover:text-red-400'
														>
															刪除
														</button>
													</div>
												</div>
											)}
										</Draggable>
									))
								)}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>

			<div className='mt-8 bg-secondary p-4 rounded-lg text-sm text-text-muted'>
				<h3 className='font-bold mb-2 text-text'>💡 管理提示</h3>
				<ul className='list-disc pl-5 space-y-1'>
					<li>「分類下拉選單」不需要 URL，它會自動讀取資料庫中的分類項目渲染至前台導覽列。</li>
					<li>您可以拖動每一列左側的把手來重新排序選單節點，前台將即時反應最新排序。</li>
					<li>若勾選「隱藏」，選單將不會在前台顯示。</li>
				</ul>
			</div>
		</div>
	);
}
