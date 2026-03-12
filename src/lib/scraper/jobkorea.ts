import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://www.jobkorea.co.kr/Search/?stext=개발자&local=0&jobtype=0';

export async function scrapeJobkorea(browser: Browser): Promise<JobPosting[]> {
  console.log('[잡코리아] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // 잡코리아는 두 가지 레이아웃 선택자 시도
    const selector = '.list-default .post-list-line, .list-default li.post-list-line';
    await page.waitForSelector(selector, { timeout: 12000 });

    const jobs = await page.evaluate((t: string) => {
      const items = document.querySelectorAll('.list-default .post-list-line');
      return Array.from(items).slice(0, 30).map((item) => {
        const titleEl = item.querySelector('.post-list-info .title a, .information-title a');
        const companyEl = item.querySelector('.post-list-corp .name a, .corp-name a');
        const locationEl = item.querySelector('.post-list-info .work-place, .work-place');
        const experienceEl = item.querySelector('.post-list-info .career, .career');

        const href = titleEl?.getAttribute('href') ?? '';
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

    console.log(`[잡코리아] ${jobs.length}건 수집`);
    return jobs;
  } finally {
    await context.close();
  }
}
