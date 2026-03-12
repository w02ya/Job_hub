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
    await page.waitForTimeout(3000); // SPA 렌더링 대기
    console.log('[링커리어] 페이지 로드 완료');

    // 실제 채용공고 링크 구조 확인
    const debug = await page.evaluate(() => {
      const recruitLinks = Array.from(document.querySelectorAll('a[href*="/recruit/"]'))
        .filter(a => /\/recruit\/\d+/.test((a as HTMLAnchorElement).href))
        .slice(0, 5)
        .map(a => ({
          href: (a as HTMLAnchorElement).href,
          text: a.textContent?.trim().slice(0, 80),
          parentClass: a.parentElement?.className?.toString().slice(0, 100),
        }));
      return { recruitLinks };
    });
    console.log('[링커리어] 채용공고 링크 샘플:', JSON.stringify(debug.recruitLinks, null, 2));

    const jobs = await page.evaluate((t: string) => {
      // /recruit/{숫자} 패턴 — 실제 채용공고 상세 링크만 추출
      const links = Array.from(document.querySelectorAll('a[href*="/recruit/"]'))
        .filter(a => /\/recruit\/\d+/.test((a as HTMLAnchorElement).href)) as HTMLAnchorElement[];

      const seen = new Set<string>();
      return links.slice(0, 30).reduce<any[]>((acc, link) => {
        const href = link.href;
        if (seen.has(href)) return acc;
        seen.add(href);

        // 링크를 감싸는 카드 컨테이너 탐색
        const card = link.closest('article, li, [class*="Card"], [class*="card"], [class*="item"]') ?? link.parentElement;

        // 제목: 카드 안에서 가장 큰/첫 번째 텍스트 요소
        const titleEl =
          card?.querySelector('h2, h3, h4, [class*="title"], [class*="Title"], strong') ??
          link;

        // 회사명: 링크와 별개 요소
        const companyEl = card?.querySelector(
          '[class*="organization"], [class*="Organization"], [class*="company"], [class*="corp"]'
        );

        // 마감일
        const deadlineEl = card?.querySelector(
          '[class*="deadline"], [class*="Deadline"], [class*="date"], [class*="Date"], time'
        );

        const id = href.match(/\/recruit\/(\d+)/)?.[1] ?? Math.random().toString(36).slice(2, 9);
        const title = titleEl?.textContent?.trim() ?? '';

        // 제목이 빈 경우 스킵
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
    if (jobs.length > 0) console.log('[링커리어] 첫 번째 공고:', JSON.stringify(jobs[0]));
    return jobs;
  } catch (err) {
    console.error('[링커리어] ❌ 실패:', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
