import { isRasterImageFile } from '@/lib/imageFile';

/**
 * 將圖片壓縮並轉換為 WebP 格式
 * @param file 原始圖片檔案 (File)
 * @param quality 壓縮品質 (0.0 到 1.0，預設 0.8)
 * @returns 壓縮後的 WebP 檔案 (File)，若轉換失敗則回傳原始檔案
 */
export async function compressImageToWebp(file: File, quality = 0.8): Promise<File> {
	// 僅處理可壓縮的點陣圖，SVG 與不支援格式維持原檔
	if (!isRasterImageFile(file)) {
		return file;
	}

	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				// 建立 Canvas
				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					// 無法取得 context，回傳原始檔案
					resolve(file);
					return;
				}

				// 將圖片繪製到 Canvas
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

				// 轉換為 WebP Blob
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							// 轉換失敗，回傳原始檔案
							resolve(file);
							return;
						}

						// 建立新的 File 物件
						const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
						const webpFile = new File([blob], newFileName, {
							type: 'image/webp',
							lastModified: Date.now(),
						});

						resolve(webpFile);
					},
					'image/webp',
					quality
				);
			};
			img.onerror = () => {
				// 圖片載入失敗，回傳原始檔案
				resolve(file);
			};

			// 確保 e.target?.result 是字串
			if (typeof e.target?.result === 'string') {
				img.src = e.target.result;
			} else {
				resolve(file);
			}
		};
		reader.onerror = () => {
			// 讀取檔案失敗，回傳原始檔案
			resolve(file);
		};
		reader.readAsDataURL(file);
	});
}
