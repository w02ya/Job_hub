import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://www.rocketpunch.com/jobs?keywords=개발자';

export async function scrapeRocketpunch(browser: Browser): Promise<JobPosting[]> {
  console.log('[로켓펀치] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
    console.log('[로켓펀치] 페이지 로드 완료');

    // 로켓펀치는 React SPA — JS 렌더 후 선택자 대기
    await page.waitForSelector('[class*="JobCard"], [class*="job-card"], .job-list a', {
      state: 'attached',
      timeout: 12000,
    });

    const jobs = await page.evaluate((t: string) => {
      // 로켓펀치 실제 구조: 링크 기반으로 추출
      const links = Array.from(document.querySelectorAll('a[href*="/jobs/"]')).filter((a) => {
        const href = (a as HTMLAnchorElement).href;
        return href.includes('/jobs/') && !href.endsWith('/jobs/');
      }) as HTMLAnchorElement[];

      const seen = new Set<string>();
      return links.slice(0, 30).reduce<any[]>((acc, link) => {
        const href = link.href;
        if (seen.has(href)) return acc;
        seen.add(href);

        const card = link.closest('[class*="Card"], [class*="item"], li, article') ?? link.parentElement;
        const titleEl = card?.querySelector('h2, h3, h4, [class*="title"], [class*="name"]') ?? link;
        const companyEl = card?.querySelector('[class*="company"], [class*="startup"], [class*="corp"]');
        const locationEl = card?.querySelector('[class*="location"], [class*="loc"]');
        const techEls = card?.querySelectorAll('[class*="skill"], [class*="tag"], [class*="tech"]') ?? [];
        const id = href.split('/').pop() ?? Math.random().toString(36).slice(2, 9);

        acc.push({
          id: `rocketpunch-${id}`,
          platform: '로켓펀치',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: titleEl?.textContent?.trim() ?? 'No Title',
          location: locationEl?.textContent?.trim() ?? '미상',
          experience: '경력 확인',
          techStacks: Array.from(techEls).map((el) => el.textContent?.trim() ?? '').filter(Boolean),
          url: href,
          deadline: '상시채용',
          postedAt: t,
        });
        return acc;
      }, []);
    }, today());

    console.log(`[로켓펀치] ✅ ${jobs.length}건 수집`);
    return jobs;
  } catch (err) {
    console.error('[로켓펀치] ❌ 실패:', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
