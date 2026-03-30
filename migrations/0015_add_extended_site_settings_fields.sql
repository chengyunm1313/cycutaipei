-- 補齊 site_settings 在新專案初始化時缺少的聯絡與社群欄位
ALTER TABLE site_settings ADD COLUMN tax_id TEXT;
ALTER TABLE site_settings ADD COLUMN phone TEXT;
ALTER TABLE site_settings ADD COLUMN fax TEXT;
ALTER TABLE site_settings ADD COLUMN address TEXT;
ALTER TABLE site_settings ADD COLUMN email TEXT;
ALTER TABLE site_settings ADD COLUMN facebook_url TEXT;
ALTER TABLE site_settings ADD COLUMN instagram_url TEXT;
ALTER TABLE site_settings ADD COLUMN youtube_url TEXT;
ALTER TABLE site_settings ADD COLUMN line_url TEXT;
ALTER TABLE site_settings ADD COLUMN copyright TEXT;
ALTER TABLE site_settings ADD COLUMN enquiry_subjects TEXT;
