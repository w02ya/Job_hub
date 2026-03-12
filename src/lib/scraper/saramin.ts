import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://www.saramin.co.kr/zf_user/jobs/list/job-category?cat_kewd=2232&panel_type=list&search_optional_item=y&search_done=y&panel_count=y&page_count=40&sort=RL&type=job';

export async function scrapeSaramin(browser: Browser): Promise<JobPosting[]> {
  console.log('[사람인] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
    console.log('[사람인] 페이지 로드 완료');

    // 사람인 실제 선택자 — 여러 가지 시도
    const selector = '.list_body .item_recruit, .list_item, .job_list .item';
    await page.waitForSelector(selector, { state: 'attached', timeout: 10000 });

    const jobs = await page.evaluate((t: string) => {
      const items =
        document.querySelectorAll('.list_body .item_recruit').length > 0
          ? document.querySelectorAll('.list_body .item_recruit')
          : document.querySelectorAll('.list_item');

      return Array.from(items).slice(0, 30).map((item) => {
        const titleEl = item.querySelector('.job_tit a, .tit a, h2 a');
        const companyEl = item.querySelector('.corp_name a, .company a');
        const locationEl = item.querySelector('.work_place, .location');
        const experienceEl = item.querySelector('.career, .experience');
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

    console.log(`[사람인] ✅ ${jobs.length}건 수집`);
    return jobs;
  } catch (err) {
    console.error('[사람인] ❌ 실패:', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
