import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://www.jobkorea.co.kr/Search/?stext=개발자&local=0&jobtype=0';

export async function scrapeJobkorea(browser: Browser): Promise<JobPosting[]> {
  console.log('[잡코리아] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
    // JS 렌더링 대기
    await page.waitForTimeout(3000);
    console.log('[잡코리아] 페이지 로드 완료');

    // 실제 HTML 구조 확인용 덤프
    const html = await page.evaluate(() => {
      // 주요 컨테이너 클래스 목록 출력
      const allClasses = new Set<string>();
      document.querySelectorAll('[class]').forEach(el => {
        el.className.toString().split(' ').forEach(c => { if (c) allClasses.add(c); });
      });
      return {
        bodySnippet: document.body.innerHTML.slice(0, 3000),
        classList: [...allClasses].slice(0, 50).join(', '),
        linkCount: document.querySelectorAll('a[href*="jobkorea"]').length,
      };
    });
    console.log('[잡코리아] 클래스 목록:', html.classList);
    console.log('[잡코리아] HTML:', html.bodySnippet);

    // 링크 기반 추출 (선택자 무관하게 동작)
    const jobs = await page.evaluate((t: string) => {
      const links = Array.from(
        document.querySelectorAll('a[href*="GI_No"], a[href*="jobkorea.co.kr/Recruit"]')
      ) as HTMLAnchorElement[];

      const seen = new Set<string>();
      return links.slice(0, 30).reduce<any[]>((acc, link) => {
        const href = link.href;
        if (!href || seen.has(href)) return acc;
        seen.add(href);

        const row = link.closest('li, tr, article, .item, [class*="list"]') ?? link.parentElement;
        const titleEl = link.querySelector('strong, span, p') ?? link;
        const companyEl = row?.querySelector('[class*="corp"], [class*="company"], [class*="name"]');
        const locationEl = row?.querySelector('[class*="location"], [class*="local"], [class*="area"]');
        const id = href.match(/GI_No=(\d+)/)?.[1] ?? Math.random().toString(36).slice(2, 9);

        if (!titleEl?.textContent?.trim()) return acc;

        acc.push({
          id: `jobkorea-${id}`,
          platform: '잡코리아',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: (titleEl?.textContent ?? link.textContent ?? '').trim(),
          location: locationEl?.textContent?.trim() ?? '미상',
          experience: '경력 확인',
          techStacks: [] as string[],
          url: href,
          deadline: '상시채용',
          postedAt: t,
        });
        return acc;
      }, []);
    }, today());

    console.log(`[잡코리아] ✅ ${jobs.length}건 수집`);
    return jobs;
  } catch (err) {
    console.error('[잡코리아] ❌ 실패:', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
