import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { DEFAULT_UA, today } from './utils';

export async function scrapeWanted(browser: Browser, category = '873'): Promise<JobPosting[]> {
  const url = `https://www.wanted.co.kr/wdlist/518/${category}`;
  console.log(`[원티드] 크롤링 시작 → ${url}`);

  // 원티드는 CSS 차단 시 load 이벤트가 안 뜨므로 차단 없이 실행
  const context = await browser.newContext({
    userAgent: DEFAULT_UA,
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('[원티드] 페이지 로드 완료, 공고 리스트 대기 중...');

    await page.waitForSelector('li[data-cy="job-card"]', { timeout: 20000 });
    console.log('[원티드] 공고 리스트 발견');

    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await page.waitForTimeout(1500);
    }

    const jobs = await page.evaluate((t: string) => {
      return Array.from(document.querySelectorAll('li[data-cy="job-card"]')).map((item) => {
        const link = item.querySelector('a');
        const title =
          item.querySelector('strong[class*="JobCard_title"]') ??
          item.querySelector('strong') ??
          item.querySelector('h2');
        const company = item.querySelector('span[class*="JobCard_companyName"]');
        const location = item.querySelector('span[class*="JobCard_location"]');
        const href = link?.getAttribute('href') ?? '';
        const id = href.split('/').pop() || Math.random().toString(36).slice(2, 9);

        return {
          id: `wanted-${id}`,
          platform: '원티드',
          company: company?.textContent?.trim() ?? 'Unknown',
          title: title?.textContent?.trim() ?? 'No Title',
          location: location?.textContent?.trim() ?? '미상',
          experience: '경력 확인',
          techStacks: [] as string[],
          url: href ? `https://www.wanted.co.kr${href}` : '',
          deadline: '상시채용',
          postedAt: t,
        };
      });
    }, today());

    if (jobs.length === 0) {
      const html = await page.content();
      console.warn('[원티드] ⚠️ 0건 — HTML(앞 500자):', html.slice(0, 500));
    } else {
      console.log(`[원티드] ✅ ${jobs.length}건 수집`);
    }
    return jobs;
  } catch (err) {
    console.error('[원티드] ❌ 예외:', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
