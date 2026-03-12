import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://www.rocketpunch.com/jobs?keywords=개발자';

export async function scrapeRocketpunch(browser: Browser): Promise<JobPosting[]> {
  console.log('[로켓펀치] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    console.log('[로켓펀치] 페이지 로딩 중...');
    await page.goto(URL, { waitUntil: 'load', timeout: 25000 });
    console.log('[로켓펀치] 페이지 로드 완료');

    const bodyText = await page.evaluate(() => document.body.innerHTML.slice(0, 2000));
    console.log('[로켓펀치] body HTML 앞부분:', bodyText);

    await page.waitForSelector('.job.item', { timeout: 10000 });

    const jobs = await page.evaluate((t: string) => {
      return Array.from(document.querySelectorAll('.job.item')).slice(0, 30).map((item) => {
        const titleEl = item.querySelector('.name a, .job-name a');
        const companyEl = item.querySelector('.company-name a, .startup-name a');
        const locationEl = item.querySelector('.location, .job-location');
        const techEls = item.querySelectorAll('.tag, .skill-tag');
        const href = titleEl?.getAttribute('href') ?? '';
        const id = href.split('/').pop() ?? Math.random().toString(36).slice(2, 9);

        return {
          id: `rocketpunch-${id}`,
          platform: '로켓펀치',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: titleEl?.textContent?.trim() ?? 'No Title',
          location: locationEl?.textContent?.trim() ?? '미상',
          experience: '경력 확인',
          techStacks: Array.from(techEls).map((el) => el.textContent?.trim() ?? '').filter(Boolean),
          url: href.startsWith('http') ? href : `https://www.rocketpunch.com${href}`,
          deadline: '상시채용',
          postedAt: t,
        };
      });
    }, today());

    console.log(`[로켓펀치] ✅ ${jobs.length}건 수집`);
    return jobs;
  } catch (err) {
    console.error('[로켓펀치] ❌ 실패 (빈 배열 반환):', err instanceof Error ? err.message : err);
    return [];
  } finally {
    await context.close();
  }
}
