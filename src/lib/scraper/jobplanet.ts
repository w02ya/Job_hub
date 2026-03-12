import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://www.jobplanet.co.kr/job_postings/search?q=개발자&order_by=recommended';

export async function scrapeJobplanet(browser: Browser): Promise<JobPosting[]> {
  console.log('[잡플래닛] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    console.log('[잡플래닛] 페이지 로딩 중...');
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 25000 });
    console.log('[잡플래닛] 페이지 로드 완료, 리스트 대기 중...');
    await page.waitForSelector('.wr-card-wrap li, .job-list-item', { timeout: 12000 });
    console.log('[잡플래닛] 리스트 선택자 발견');

    const jobs = await page.evaluate((t: string) => {
      const items = document.querySelectorAll('.wr-card-wrap li');
      return Array.from(items).slice(0, 30).map((item) => {
        const titleEl = item.querySelector('.job-name a, .name a, h4 a');
        const companyEl = item.querySelector('.company-name a, .corp-name a');
        const locationEl = item.querySelector('.location, .loc');
        const experienceEl = item.querySelector('.experience, .career');
        const techEls = item.querySelectorAll('.skill, .tag');

        const href = titleEl?.getAttribute('href') ?? '';
        const id = href.match(/\/(\d+)/)?.[1] ?? Math.random().toString(36).slice(2, 9);

        return {
          id: `jobplanet-${id}`,
          platform: '잡플래닛',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: titleEl?.textContent?.trim() ?? 'No Title',
          location: locationEl?.textContent?.trim() ?? '미상',
          experience: experienceEl?.textContent?.trim() ?? '경력 확인',
          techStacks: Array.from(techEls).map((el) => el.textContent?.trim() ?? '').filter(Boolean),
          url: href.startsWith('http') ? href : `https://www.jobplanet.co.kr${href}`,
          deadline: '상시채용',
          postedAt: t,
        };
      });
    }, today());

    if (jobs.length === 0) {
      console.warn('[잡플래닛] ⚠️  수집된 공고 0건 — 선택자 확인 필요');
    } else {
      console.log(`[잡플래닛] ✅ ${jobs.length}건 수집`);
    }
    return jobs;
  } catch (err) {
    console.error('[잡플래닛] 예외 발생:', err instanceof Error ? err.message : err);
    throw err;
  } finally {
    await context.close();
  }
}
