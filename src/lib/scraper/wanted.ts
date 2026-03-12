import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today, randomId } from './utils';

export async function scrapeWanted(browser: Browser, category = '873'): Promise<JobPosting[]> {
  const url = `https://www.wanted.co.kr/wdlist/518/${category}`;
  console.log(`[원티드] 크롤링 시작 → ${url}`);

  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    console.log(`[원티드] 페이지 로딩 중...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    console.log(`[원티드] 페이지 로드 완료, 공고 리스트 대기 중...`);
    await page.waitForSelector('li[data-cy="job-card"]', { timeout: 10000 });

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await page.waitForTimeout(1200 + Math.random() * 800);
    }

    const jobs = await page.evaluate((t: string) => {
      return Array.from(document.querySelectorAll('li[data-cy="job-card"]')).map((item) => {
        const link = item.querySelector('a');
        const title = item.querySelector('strong[class*="JobCard_title"]');
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
      console.warn('[원티드] ⚠️  수집된 공고 0건 — 선택자가 변경됐을 수 있음');
      const html = await page.content();
      console.warn('[원티드] 페이지 HTML 앞부분:', html.slice(0, 500));
    } else {
      console.log(`[원티드] ✅ ${jobs.length}건 수집`);
    }
    return jobs;
  } catch (err) {
    console.error('[원티드] 예외 발생:', err instanceof Error ? err.message : err);
    throw err;
  } finally {
    await context.close();
  }
}
