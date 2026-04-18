import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

interface TikTokVideoData {
    url: string;
    id: string;
    description: string;
}

class TikTokDownloader {
    private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    private cookies: string = '';

    /**
     * Получает HTML страницы TikTok с поддержкой редиректов
     */
    private async fetchHTML(url: string, followRedirects: number = 5): Promise<string> {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'identity',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0',
                },
            };

            https.get(url, options, (res) => {
                // Сохраняем cookies
                if (res.headers['set-cookie']) {
                    this.cookies = res.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
                    console.log('✓ Cookies сохранены');
                }

                // Обработка редиректов
                if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && followRedirects > 0) {
                    const redirectUrl = res.headers.location;
                    if (redirectUrl) {
                        console.log(`Редирект: ${redirectUrl}`);
                        this.fetchHTML(redirectUrl, followRedirects - 1).then(resolve).catch(reject);
                        return;
                    }
                }

                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    return;
                }

                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(data);
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    /**
     * Извлекает данные видео из HTML
     */
    private extractVideoData(html: string): TikTokVideoData | null {
        try {
            console.log('Попытка извлечь данные...');

            // Метод 1: __UNIVERSAL_DATA_FOR_REHYDRATION__
            const universalDataMatch = html.match(/<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/s);

            if (universalDataMatch) {
                console.log('✓ Найден __UNIVERSAL_DATA_FOR_REHYDRATION__');
                try {
                    const jsonData = JSON.parse(universalDataMatch[1]);
                    const videoDetail = jsonData?.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct;

                    if (videoDetail?.video) {
                        // Приоритет: playAddr > downloadAddr (playAddr работает лучше)
                        const videoUrl = videoDetail.video.playAddr ||
                            videoDetail.video.downloadAddr ||
                            videoDetail.video.bitrateInfo?.[0]?.PlayAddr?.UrlList?.[0];

                        if (videoUrl) {
                            console.log('✓ URL видео найден в __UNIVERSAL_DATA_FOR_REHYDRATION__');
                            return {
                                url: videoUrl,
                                id: videoDetail.id,
                                description: videoDetail.desc || 'tiktok_video',
                            };
                        }
                    }
                } catch (e) {
                    console.log('✗ Ошибка парсинга __UNIVERSAL_DATA_FOR_REHYDRATION__:', e);
                }
            }

            // Метод 2: SIGI_STATE
            const sigiMatch = html.match(/<script[^>]*id="SIGI_STATE"[^>]*>(.*?)<\/script>/s);

            if (sigiMatch) {
                console.log('✓ Найден SIGI_STATE');
                try {
                    const jsonData = JSON.parse(sigiMatch[1]);
                    const itemModule = jsonData?.ItemModule;

                    if (itemModule) {
                        const videoId = Object.keys(itemModule)[0];
                        const videoData = itemModule[videoId];

                        if (videoData?.video) {
                            const videoUrl = videoData.video.playAddr ||
                                videoData.video.downloadAddr ||
                                videoData.video.bitrateInfo?.[0]?.PlayAddr?.UrlList?.[0];

                            if (videoUrl) {
                                console.log('✓ URL видео найден в SIGI_STATE');
                                return {
                                    url: videoUrl,
                                    id: videoId,
                                    description: videoData.desc || 'tiktok_video',
                                };
                            }
                        }
                    }
                } catch (e) {
                    console.log('✗ Ошибка парсинга SIGI_STATE:', e);
                }
            }

            return null;
        } catch (error) {
            console.error('Критическая ошибка при парсинге:', error);
            return null;
        }
    }

    /**
     * Скачивает файл по URL с правильными заголовками
     */
    private async downloadFile(url: string, outputPath: string): Promise<void> {
        // Декодируем escaped символы
        url = url.replace(/\\u002F/g, '/').replace(/\\/g, '');

        return new Promise((resolve, reject) => {
            const makeRequest = (requestUrl: string, redirectCount: number = 0) => {
                if (redirectCount > 10) {
                    reject(new Error('Слишком много редиректов'));
                    return;
                }

                const urlObj = new URL(requestUrl);
                const protocol = urlObj.protocol === 'https:' ? https : http;

                const options = {
                    headers: {
                        'User-Agent': this.userAgent,
                        'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'identity',
                        'Referer': 'https://www.tiktok.com/',
                        'Origin': 'https://www.tiktok.com',
                        'Connection': 'keep-alive',
                        'Sec-Fetch-Dest': 'video',
                        'Sec-Fetch-Mode': 'no-cors',
                        'Sec-Fetch-Site': 'same-site',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache',
                        ...(this.cookies && { 'Cookie': this.cookies }),
                    },
                };

                console.log(`📡 Запрос к: ${urlObj.hostname}`);

                protocol.get(requestUrl, options, (res) => {
                    // Обработка редиректов
                    if ([301, 302, 303, 307, 308].includes(res.statusCode!)) {
                        const redirectUrl = res.headers.location;
                        if (redirectUrl) {
                            console.log(`🔄 Редирект (${res.statusCode}): ${redirectUrl.substring(0, 80)}...`);
                            makeRequest(redirectUrl, redirectCount + 1);
                            return;
                        }
                    }

                    if (res.statusCode !== 200 && res.statusCode !== 206) {
                        console.error(`❌ Статус: ${res.statusCode}`);
                        console.error(`❌ Заголовки ответа:`, res.headers);
                        reject(new Error(`Ошибка загрузки: статус ${res.statusCode}`));
                        return;
                    }

                    console.log(`✓ Успешное подключение (статус ${res.statusCode})`);

                    const fileStream = fs.createWriteStream(outputPath);
                    let downloadedSize = 0;
                    const totalSize = parseInt(res.headers['content-length'] || '0', 10);

                    res.on('data', (chunk) => {
                        downloadedSize += chunk.length;
                        if (totalSize > 0) {
                            const progress = ((downloadedSize / totalSize) * 100).toFixed(2);
                            process.stdout.write(`\r💾 Загрузка: ${progress}% (${(downloadedSize / 1024 / 1024).toFixed(2)} MB)`);
                        } else {
                            process.stdout.write(`\r💾 Загружено: ${(downloadedSize / 1024 / 1024).toFixed(2)} MB`);
                        }
                    });

                    res.pipe(fileStream);

                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log('\n✅ Загрузка завершена!');
                        resolve();
                    });

                    fileStream.on('error', (err) => {
                        fs.unlink(outputPath, () => { });
                        reject(err);
                    });
                }).on('error', (err) => {
                    reject(err);
                });
            };

            makeRequest(url);
        });
    }

    /**
     * Нормализует URL TikTok
     */
    private async normalizeUrl(url: string): Promise<string> {
        url = url.split('?')[0];

        if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
            console.log('Обработка короткой ссылки...');
            return new Promise((resolve, reject) => {
                https.get(url, {
                    headers: {
                        'User-Agent': this.userAgent,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    }
                }, (res) => {
                    const location = res.headers.location;
                    if (location) {
                        console.log(`✓ Получен полный URL: ${location}`);
                        resolve(location.split('?')[0]);
                    } else {
                        reject(new Error('Не удалось получить полный URL'));
                    }
                }).on('error', reject);
            });
        }

        return url;
    }

    /**
     * Основной метод для скачивания видео
     */
    public async download(videoUrl: string, outputDir: string = './downloads'): Promise<string> {
        try {
            console.log('🚀 Начало обработки...');
            console.log(`📎 URL: ${videoUrl}`);

            const normalizedUrl = await this.normalizeUrl(videoUrl);
            console.log(`📎 Нормализованный URL: ${normalizedUrl}`);

            console.log('📥 Получение HTML страницы...');
            const html = await this.fetchHTML(normalizedUrl);
            console.log(`✓ HTML получен (${html.length} символов)`);

            const videoData = this.extractVideoData(html);

            if (!videoData) {
                throw new Error('Не удалось извлечь данные видео. Проверьте URL');
            }

            console.log(`✓ Найдено видео: ${videoData.description.substring(0, 50)}...`);
            console.log(`✓ ID: ${videoData.id}`);

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const sanitizedDesc = videoData.description
                .replace(/[^a-zA-Z0-9а-яА-Я\s]/g, '')
                .substring(0, 30)
                .trim() || 'video';

            const fileName = `${sanitizedDesc}_${videoData.id}.mp4`;
            const outputPath = path.join(outputDir, fileName);

            console.log(`💾 Скачивание в: ${outputPath}`);
            await this.downloadFile(videoData.url, outputPath);

            console.log(`✅ Видео успешно сохранено: ${outputPath}`);
            return outputPath;
        } catch (error) {
            console.error('❌ Ошибка:', error);
            throw error;
        }
    }
}

// Пример использования
async function main() {
    const downloader = new TikTokDownloader();

    const videoUrl = process.argv[2];

    if (!videoUrl) {
        console.log('Использование: ts-node test.ts <URL_ВИДЕО>');
        console.log('Пример: ts-node test.ts https://www.tiktok.com/@username/video/1234567890');
        console.log('Пример: ts-node test.ts https://vt.tiktok.com/ZSFxxxxx/');
        process.exit(1);
    }

    try {
        await downloader.download(videoUrl);
    } catch (error) {
        console.error('Не удалось скачать видео');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export default TikTokDownloader;