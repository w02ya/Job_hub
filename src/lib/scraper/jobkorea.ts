import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://www.jobkorea.co.kr/Search/?stext=개발자&local=0&jobtype=0';

export async function scrapeJobkorea(browser: Browser): Promise<JobPosting[]> {
  console.log('[잡코리아] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    console.log('[잡코리아] 페이지 로딩 중...');
    await page.goto(URL, { waitUntil: 'load', timeout: 25000 });
    console.log('[잡코리아] 페이지 로드 완료');

    const bodyText = await page.evaluate(() => document.body.innerHTML.slice(0, 2000));
    console.log('[잡코리아] body HTML 앞부분:', bodyText);

    await page.waitForSelector('.list-default .post-list-line', { timeout: 10000 });

    const jobs = await page.evaluate((t: string) => {
      return Array.from(document.querySelectorAll('.list-default .post-list-line')).slice(0, 30).map((item) => {
        const titleEl = item.querySelector('.information-title a, .post-list-info .title a');
        const companyEl = item.querySelector('.corp-name a, .post-list-corp .name a');
        const locationEl = item.querySelector('.work-place, .post-list-info .work-place');
        const experienceEl = item.querySelector('.career, .post-list-info .career');
        const href = titleEl?.getAttribute('href') ?? '';
        const id = href.match(/GI_No=(\d+)/)?.[1] ?? Math.random().toString(36).slice(2, 9);

        return {
          id: `jobkorea-${id}`,
          platform: '잡코리아',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: titleEl?.textContent?.trim() ?? 'No Title',
          location: locationEl?.textContent?.trim() ?? '미상',
          experience: experienceEl?.textContent?.trim() ?? '경력 확인',
          techStacks: [] as string[],
          url: href.startsWith('http') ? href : `https://www.jobkorea.co.kr${href}`,
          deadline: '상시채용',
          postedAt: t,
        };
      });
    }, today());

    console.log(`[잡코리아] ✅ ${jobs.length}건 수집`);
    return jobs;
  } catch (err) {
    console.error('[잡코리아] ❌ 실패 (빈 배열 반환):', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
