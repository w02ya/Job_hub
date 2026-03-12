import { Browser, BrowserContext } from 'playwright';

export const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** 이미지·폰트·CSS 차단 컨텍스트 생성 */
export async function createLightContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    userAgent: DEFAULT_UA,
    viewport: { width: 1280, height: 800 },
  });

  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['image', 'font', 'stylesheet', 'media'].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  return context;
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function randomId(): string {
  return Math.random().toString(36).slice(2, 9);
}
