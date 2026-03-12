import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

// 잡코리아 개발직군 검색
const URL = 'https://www.jobkorea.co.kr/Search/?stext=프론트엔드+백엔드&local=0&jobtype=0';

export async function scrapeJobkorea(browser: Browser): Promise<JobPosting[]> {
  console.log('[잡코리아] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
    console.log('[잡코리아] 페이지 로드 완료');

    // 잡코리아 실제 선택자 탐색
    await page.waitForSelector('.list-post, .recruit-info, #dev-gi-list .post', {
      state: 'attached',
      timeout: 10000,
    });

    const jobs = await page.evaluate((t: string) => {
      // 잡코리아는 여러 레이아웃 존재 — 가장 많은 것 선택
      const candidates = [
        document.querySelectorAll('.list-post'),
        document.querySelectorAll('.recruit-list .post'),
        document.querySelectorAll('#dev-gi-list li'),
      ];
      const items = [...candidates].sort((a, b) => b.length - a.length)[0];

      return Array.from(items).slice(0, 30).map((item) => {
        const titleEl = item.querySelector('.title a, .post-title a, h4 a, .tit a');
        const companyEl = item.querySelector('.corp-name, .company a, .name a');
        const locationEl = item.querySelector('.work-place, .loc, .location');
        const experienceEl = item.querySelector('.career, .experience, .exp');
        const href = (titleEl as HTMLAnchorElement)?.href ?? titleEl?.getAttribute('href') ?? '';
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
    console.error('[잡코리아] ❌ 실패:', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
