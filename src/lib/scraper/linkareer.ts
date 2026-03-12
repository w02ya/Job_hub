import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://linkareer.com/list/recruit?filterBy_activityTypes=JOB&orderBy=RECENT';

export async function scrapeLinkareer(browser: Browser): Promise<JobPosting[]> {
  console.log('[링커리어] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    console.log('[링커리어] 페이지 로딩 중...');
    await page.goto(URL, { waitUntil: 'load', timeout: 25000 });
    console.log('[링커리어] 페이지 로드 완료');

    const bodyText = await page.evaluate(() => document.body.innerHTML.slice(0, 2000));
    console.log('[링커리어] body HTML 앞부분:', bodyText);

    await page.waitForSelector('article[class*="ActivityCard"], .activity-card, .list-item', { timeout: 10000 });

    const jobs = await page.evaluate((t: string) => {
      const items = document.querySelectorAll('article[class*="ActivityCard"], .activity-card, .list-item');
      return Array.from(items).slice(0, 30).map((item) => {
        const titleEl = item.querySelector('h3 a, h4 a, .title a, [class*="title"] a');
        const companyEl = item.querySelector('[class*="organization"], [class*="company"], .org-name');
        const locationEl = item.querySelector('[class*="location"], .location');
        const deadlineEl = item.querySelector('[class*="deadline"], .deadline, time');
        const href = titleEl?.getAttribute('href') ?? item.querySelector('a')?.getAttribute('href') ?? '';
        const id = href.split('/').pop() ?? Math.random().toString(36).slice(2, 9);

        return {
          id: `linkareer-${id}`,
          platform: '링커리어',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: titleEl?.textContent?.trim() ?? 'No Title',
          location: locationEl?.textContent?.trim() ?? '미상',
          experience: '신입/경력',
          techStacks: [] as string[],
          url: href.startsWith('http') ? href : `https://linkareer.com${href}`,
          deadline: deadlineEl?.textContent?.trim() ?? '상시채용',
          postedAt: t,
        };
      });
    }, today());

    console.log(`[링커리어] ✅ ${jobs.length}건 수집`);
    return jobs;
  } catch (err) {
    console.error('[링커리어] ❌ 실패 (빈 배열 반환):', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
