import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

// cat_kewd=2232: IT개발/데이터
const URL = 'https://www.saramin.co.kr/zf_user/jobs/list/job-category?cat_kewd=2232&panel_type=list&search_optional_item=y&search_done=y&panel_count=y&page_count=40&sort=RL&type=job';

export async function scrapeSaramin(browser: Browser): Promise<JobPosting[]> {
  console.log('[사람인] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    console.log('[사람인] 페이지 로딩 중...');
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('[사람인] 페이지 로드 완료, 리스트 대기 중...');
    await page.waitForSelector('.list_body .item_recruit', { timeout: 12000 });
    console.log('[사람인] 리스트 선택자 발견');

    const jobs = await page.evaluate((t: string) => {
      return Array.from(document.querySelectorAll('.list_body .item_recruit')).slice(0, 30).map((item) => {
        const titleEl = item.querySelector('.job_tit a');
        const companyEl = item.querySelector('.corp_name a');
        const locationEl = item.querySelector('.work_place');
        const experienceEl = item.querySelector('.career');
        const href = titleEl?.getAttribute('href') ?? '';

        const id = href.match(/seq=(\d+)/)?.[1] ?? Math.random().toString(36).slice(2, 9);

        return {
          id: `saramin-${id}`,
          platform: '사람인',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: titleEl?.textContent?.trim() ?? 'No Title',
          location: locationEl?.textContent?.trim() ?? '미상',
          experience: experienceEl?.textContent?.trim() ?? '경력 확인',
          techStacks: [] as string[],
          url: href.startsWith('http') ? href : `https://www.saramin.co.kr${href}`,
          deadline: '상시채용',
          postedAt: t,
        };
      });
    }, today());

    if (jobs.length === 0) {
      console.warn('[사람인] ⚠️  수집된 공고 0건 — 선택자 확인 필요');
    } else {
      console.log(`[사람인] ✅ ${jobs.length}건 수집`);
    }
    return jobs;
  } catch (err) {
    console.error('[사람인] 예외 발생:', err instanceof Error ? err.message : err);
    throw err;
  } finally {
    await context.close();
  }
}
