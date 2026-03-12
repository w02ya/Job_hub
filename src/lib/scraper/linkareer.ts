import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://linkareer.com/list/recruit';

export async function scrapeLinkareer(browser: Browser): Promise<JobPosting[]> {
  console.log('[링커리어] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(4000);
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(2000);
    console.log('[링커리어] 페이지 로드 완료');

    const jobs = await page.evaluate((t: string) => {
      // 실제 확인된 URL 패턴: /activity/{숫자}
      const links = Array.from(document.querySelectorAll('a[href*="/activity/"]'))
        .filter(a => /\/activity\/\d+/.test((a as HTMLAnchorElement).href ?? a.getAttribute('href') ?? '')) as HTMLAnchorElement[];

      const seen = new Set<string>();
      return links.slice(0, 30).reduce<any[]>((acc, link) => {
        const href = link.href || `https://linkareer.com${link.getAttribute('href')}`;
        if (seen.has(href)) return acc;
        seen.add(href);

        const card = link.closest('li, article, [class*="card"], [class*="Card"], [class*="item"]') ?? link.parentElement;
        const titleEl = card?.querySelector('h2, h3, h4, [class*="title"], [class*="Title"], strong') ?? link;
        const companyEl = card?.querySelector('[class*="organization"], [class*="company"], [class*="corp"], [class*="org"]');
        const deadlineEl = card?.querySelector('[class*="deadline"], [class*="date"], time');
        const id = href.match(/\/activity\/(\d+)/)?.[1] ?? Math.random().toString(36).slice(2, 9);

        const title = titleEl?.textContent?.trim() ?? '';
        if (!title || title.length < 2) return acc;

        acc.push({
          id: `linkareer-${id}`,
          platform: '링커리어',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title,
          location: '미상',
          experience: '신입/경력',
          techStacks: [] as string[],
          url: href,
          deadline: deadlineEl?.textContent?.trim() ?? '상시채용',
          postedAt: t,
        });
        return acc;
      }, []);
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
