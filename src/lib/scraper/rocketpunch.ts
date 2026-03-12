import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';

// 로켓펀치: CloudFront 403 — 봇 차단 중
// TODO: stealth 모드 또는 API 방식으로 추후 구현
export async function scrapeRocketpunch(_browser: Browser): Promise<JobPosting[]> {
  console.log('[로켓펀치] ⚠️  현재 봇 차단(CloudFront 403)으로 수집 불가 (준비 중)');
  return [];
}
