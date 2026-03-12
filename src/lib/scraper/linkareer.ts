import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';
import { createLightContext, today } from './utils';

const URL = 'https://linkareer.com/list/recruit?filterBy_activityTypes=JOB&orderBy=RECENT';

export async function scrapeLinkareer(browser: Browser): Promise<JobPosting[]> {
  console.log('[링커리어] 크롤링 시작');
  const context = await createLightContext(browser);
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForSelector('.list-item, article[class*="ActivityCard"], .activity-card', { timeout: 12000 });

    const jobs = await page.evaluate((t: string) => {
      // 링커리어는 다양한 레이아웃 변형 고려
      const items = document.querySelectorAll('article[class*="ActivityCard"], .activity-card, .list-item');
      return Array.from(items).slice(0, 30).map((item) => {
        const titleEl = item.querySelector('h3 a, h4 a, .title a, [class*="title"] a');
        const companyEl = item.querySelector('[class*="organization"], [class*="company"], .org-name');
        const locationEl = item.querySelector('[class*="location"], .location');
        const deadlineEl = item.querySelector('[class*="deadline"], .deadline, time');

        const href = titleEl?.getAttribute('href') ?? item.querySelector('a')?.getAttribute('href') ?? '';
        const id = href.split('/').pop() ?? Math.random().toString(36).slice(2, 9);

        return {
          id: `linkareer-${id}`,
          platform: '링커리어',
          company: companyEl?.textContent?.trim() ?? 'Unknown',
          title: titleEl?.textContent?.trim() ?? 'No Title',
          location: locationEl?.textContent?.trim() ?? '미상',
          experience: '신입/경력',
          techStacks: [] as string[],
          url: href.startsWith('http') ? href : `https://linkareer.com${href}`,
          deadline: deadlineEl?.textContent?.trim() ?? '상시채용',
          postedAt: t,
        };
      });
    }, today());

    console.log(`[링커리어] ${jobs.length}건 수집`);
    return jobs;
  } finally {
    await context.close();
  }
}
