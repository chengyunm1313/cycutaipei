import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { ensureSiteSettingsTable } from '@/db/ensureSiteSettingsTable';
import type { ApiSiteSettings } from '@/data/types';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const DEFAULT_SITE_SETTINGS: Omit<ApiSiteSettings, 'id' | 'updatedAt'> = {
	siteName: '中原大學台北市校友會',
	siteTitle: '中原大學台北市校友會 | 校友交流與活動平台',
	logoUrl: null,
	footerLogoUrl: null,
	faviconUrl: null,
	socialShareImageUrl: null,
	metaDescription: '串聯中原大學台北市校友情誼，提供最新消息、活動資訊與校友會相關服務。',
	metaKeywords: '中原大學,台北市校友會,校友活動,最新消息,校友服務',
	contactLink: null,
	taxId: null,
	phone: null,
	fax: null,
	address: null,
	email: null,
	facebookUrl: null,
	instagramUrl: null,
	youtubeUrl: null,
	lineUrl: null,
	copyright: null,
	enquirySubjects: null,
};

interface SiteSettingsRow {
	id: number;
	site_name: string;
	site_title: string | null;
	logo_url: string | null;
	footer_logo_url: string | null;
	favicon_url: string | null;
	social_share_image_url: string | null;
	meta_description: string | null;
	meta_keywords: string | null;
	contact_link: string | null;
	tax_id: string | null;
	phone: string | null;
	fax: string | null;
	address: string | null;
	email: string | null;
	facebook_url: string | null;
	instagram_url: string | null;
	youtube_url: string | null;
	line_url: string | null;
	copyright: string | null;
	enquiry_subjects: string | null;
	updated_at: string;
}

interface SiteSettingsUpdatePayload {
	siteName?: string;
	siteTitle?: string | null;
	logoUrl?: string | null;
	footerLogoUrl?: string | null;
	faviconUrl?: string | null;
	socialShareImageUrl?: string | null;
	metaDescription?: string | null;
	metaKeywords?: string | null;
	contactLink?: string | null;
	taxId?: string | null;
	phone?: string | null;
	fax?: string | null;
	address?: string | null;
	email?: string | null;
	facebookUrl?: string | null;
	instagramUrl?: string | null;
	youtubeUrl?: string | null;
	lineUrl?: string | null;
	copyright?: string | null;
	enquirySubjects?: string | null;
}

function mapSiteSettingsRow(row?: SiteSettingsRow): ApiSiteSettings {
	if (!row) {
		return {
			id: 1,
			...DEFAULT_SITE_SETTINGS,
			updatedAt: new Date().toISOString(),
		};
	}

	return {
		id: row.id,
		siteName: row.site_name,
		siteTitle: row.site_title,
		logoUrl: row.logo_url,
		footerLogoUrl: row.footer_logo_url,
		faviconUrl: row.favicon_url,
		socialShareImageUrl: row.social_share_image_url,
		metaDescription: row.meta_description,
		metaKeywords: row.meta_keywords,
		contactLink: row.contact_link,
		taxId: row.tax_id,
		phone: row.phone,
		fax: row.fax,
		address: row.address,
		email: row.email,
		facebookUrl: row.facebook_url,
		instagramUrl: row.instagram_url,
		youtubeUrl: row.youtube_url,
		lineUrl: row.line_url,
		copyright: row.copyright,
		enquirySubjects: row.enquiry_subjects,
		updatedAt: row.updated_at,
	};
}

async function getCurrentSettings(db: D1Database): Promise<ApiSiteSettings> {
	await ensureSiteSettingsTable(db);
	const { results } = await db
		.prepare(
			`SELECT id, site_name, site_title, logo_url, footer_logo_url, favicon_url, social_share_image_url, 
			        meta_description, meta_keywords, contact_link, tax_id, phone, fax, address, email, 
			        facebook_url, instagram_url, youtube_url, line_url, copyright, enquiry_subjects, updated_at
			 FROM site_settings WHERE id = 1 LIMIT 1`
		)
		.all<SiteSettingsRow>();

	return mapSiteSettingsRow(results?.[0]);
}

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json(
				{ error: 'Database not available' },
				{ status: 500, headers: corsHeaders }
			);
		}

		const settings = await getCurrentSettings(env.DB);
		return NextResponse.json(settings, { headers: corsHeaders });
	} catch (error) {
		console.error('Error in GET /api/site-settings:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json(
				{ error: 'Database not available' },
				{ status: 500, headers: corsHeaders }
			);
		}

		const current = await getCurrentSettings(env.DB);
		const payload = (await request.json()) as SiteSettingsUpdatePayload;

		const nextSiteName = (payload.siteName ?? current.siteName).trim();
		if (!nextSiteName) {
			return NextResponse.json(
				{ error: 'siteName is required' },
				{ status: 400, headers: corsHeaders }
			);
		}

		const normalized = {
			siteName: nextSiteName,
			siteTitle: payload.siteTitle ?? current.siteTitle,
			logoUrl: payload.logoUrl ?? current.logoUrl,
			footerLogoUrl: payload.footerLogoUrl ?? current.footerLogoUrl,
			faviconUrl: payload.faviconUrl ?? current.faviconUrl,
			socialShareImageUrl: payload.socialShareImageUrl ?? current.socialShareImageUrl,
			metaDescription: payload.metaDescription ?? current.metaDescription,
			metaKeywords: payload.metaKeywords ?? current.metaKeywords,
			contactLink: payload.contactLink ?? current.contactLink,
			taxId: payload.taxId ?? current.taxId,
			phone: payload.phone ?? current.phone,
			fax: payload.fax ?? current.fax,
			address: payload.address ?? current.address,
			email: payload.email ?? current.email,
			facebookUrl: payload.facebookUrl ?? current.facebookUrl,
			instagramUrl: payload.instagramUrl ?? current.instagramUrl,
			youtubeUrl: payload.youtubeUrl ?? current.youtubeUrl,
			lineUrl: payload.lineUrl ?? current.lineUrl,
			copyright: payload.copyright ?? current.copyright,
			enquirySubjects: payload.enquirySubjects ?? current.enquirySubjects,
		};

		await env.DB.prepare(
			`UPDATE site_settings
				 SET site_name = ?, site_title = ?, logo_url = ?, footer_logo_url = ?, favicon_url = ?,
				 social_share_image_url = ?, meta_description = ?, meta_keywords = ?, contact_link = ?, 
				 tax_id = ?, phone = ?, fax = ?, address = ?, email = ?, 
				 facebook_url = ?, instagram_url = ?, youtube_url = ?, line_url = ?, copyright = ?, enquiry_subjects = ?,
				 updated_at = CURRENT_TIMESTAMP
				 WHERE id = 1`
		)
			.bind(
				normalized.siteName,
				normalized.siteTitle,
				normalized.logoUrl,
				normalized.footerLogoUrl,
				normalized.faviconUrl,
				normalized.socialShareImageUrl,
				normalized.metaDescription,
				normalized.metaKeywords,
				normalized.contactLink,
				normalized.taxId,
				normalized.phone,
				normalized.fax,
				normalized.address,
				normalized.email,
				normalized.facebookUrl,
				normalized.instagramUrl,
				normalized.youtubeUrl,
				normalized.lineUrl,
				normalized.copyright,
				normalized.enquirySubjects
			)
			.run();

		const updated = await getCurrentSettings(env.DB);

		const revalidateResult = triggerSiteRevalidation({ scopes: ['siteSettings'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Site settings revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(updated, { headers: corsHeaders });
	} catch (error) {
		console.error('Error in PUT /api/site-settings:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}
