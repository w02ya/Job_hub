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
    // React SPA 렌더링 대기
    await page.waitForTimeout(4000);
    console.log('[로켓펀치] 페이지 로드 완료');

    // 실제 HTML 덤프
    const html = await page.evaluate(() => {
      const allClasses = new Set<string>();
      document.querySelectorAll('[class]').forEach(el => {
        el.className.toString().split(' ').forEach(c => { if (c) allClasses.add(c); });
      });
      return {
        bodySnippet: document.body.innerHTML.slice(0, 3000),
        classList: [...allClasses].slice(0, 60).join(', '),
        jobLinks: Array.from(document.querySelectorAll('a[href*="/jobs/"]'))
          .slice(0, 5)
          .map(a => ({ href: (a as HTMLAnchorElement).href, text: a.textContent?.trim().slice(0, 50) })),
      };
    });
    console.log('[로켓펀치] 클래스 목록:', html.classList);
    console.log('[로켓펀치] /jobs/ 링크 샘플:', JSON.stringify(html.jobLinks));
    console.log('[로켓펀치] HTML:', html.bodySnippet);

    // /jobs/{id} 패턴 링크 기반 추출
    const jobs = await page.evaluate((t: string) => {
      const links = Array.from(
        document.querySelectorAll('a[href*="/jobs/"]')
      ).filter(a => {
        const href = (a as HTMLAnchorElement).href;
        return /\/jobs\/\d+/.test(href);
      }) as HTMLAnchorElement[];

      const seen = new Set<string>();
      return links.slice(0, 30).reduce<any[]>((acc, link) => {
        const href = link.href;
        if (seen.has(href)) return acc;
        seen.add(href);

        const card = link.closest('li, article, [class*="card"], [class*="item"]') ?? link.parentElement;
        const titleEl = card?.querySelector('h2, h3, h4, [class*="title"], [class*="name"], strong') ?? link;
        const companyEl = card?.querySelector('[class*="company"], [class*="startup"], [class*="corp"]');
        const techEls = card?.querySelectorAll('[class*="skill"], [class*="tag"], [class*="tech"]') ?? [];
        const id = href.match(/\/jobs\/(\d+)/)?.[1] ?? Math.random().toString(36).slice(2, 9);

        if (!titleEl?.textContent?.trim()) return acc;

        acc.push({
          id: `rocketpunch-${id}`,
          platform: '로켓펀치',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: titleEl.textContent?.trim() ?? 'No Title',
          location: '미상',
          experience: '경력 확인',
          techStacks: Array.from(techEls).map(el => el.textContent?.trim() ?? '').filter(Boolean),
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
