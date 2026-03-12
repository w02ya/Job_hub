import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://linkareer.com/list/recruit?filterBy_activityTypes=JOB&orderBy=RECENT';

export async function scrapeLinkareer(browser: Browser): Promise<JobPosting[]> {
  console.log('[링커리어] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
    console.log('[링커리어] 페이지 로드 완료');

    // 로그에서 MuiListItem-root list-item 확인됨
    await page.waitForSelector('.list-item', { state: 'attached', timeout: 12000 });
    console.log('[링커리어] .list-item 발견');

    const jobs = await page.evaluate((t: string) => {
      const items = document.querySelectorAll('.list-item');
      return Array.from(items).slice(0, 30).map((item) => {
        // 링커리어 MUI 구조: 링크 내 텍스트 추출
        const link = item.querySelector('a[href*="/recruit/"], a[href*="/activity/"]') as HTMLAnchorElement | null;
        const allLinks = item.querySelectorAll('a');
        const titleEl =
          item.querySelector('h2, h3, h4, [class*="title"], [class*="Title"]') ??
          (allLinks[0] ?? null);
        const companyEl = item.querySelector('[class*="organization"], [class*="company"], [class*="org"]');
        const deadlineEl = item.querySelector('[class*="deadline"], [class*="date"], time');
        const href = link?.href ?? (allLinks[0] as HTMLAnchorElement)?.href ?? '';
        const id = href.split('/').pop() ?? Math.random().toString(36).slice(2, 9);

        return {
          id: `linkareer-${id}`,
          platform: '링커리어',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: titleEl?.textContent?.trim() ?? item.textContent?.slice(0, 50)?.trim() ?? 'No Title',
          location: '미상',
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
    console.error('[링커리어] ❌ 실패:', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
