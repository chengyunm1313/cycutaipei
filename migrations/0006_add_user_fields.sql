-- 擴充 users 表，加入「備註」、「照片」、「關於作者」、「社群媒體連結」欄位
ALTER TABLE users ADD COLUMN notes TEXT;
ALTER TABLE users ADD COLUMN photo_url TEXT;
ALTER TABLE users ADD COLUMN about_author TEXT;
ALTER TABLE users ADD COLUMN social_links TEXT;
