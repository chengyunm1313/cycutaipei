INSERT INTO menus (title, url, type, sort_order, target, is_active)
VALUES 
    ('首頁', '/', 'system', 0, '_self', 1),
    ('所有產品', '/products', 'system', 1, '_self', 1),
    ('產品分類', NULL, 'category_dropdown', 2, '_self', 1),
    ('部落格', '/blog', 'system', 3, '_self', 1);
