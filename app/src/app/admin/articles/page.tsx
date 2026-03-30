import { redirect } from 'next/navigation';

export default function AdminArticlesIndexPage() {
	redirect('/admin/articles/content');
}
