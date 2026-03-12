import { Browser } from 'playwright';
import { JobPosting } from '../../types/job';

// 사람인: ERR_CONNECTION_RESET — 봇 차단 중
// TODO: stealth 모드 또는 API 방식으로 추후 구현
export async function scrapeSaramin(_browser: Browser): Promise<JobPosting[]> {
  console.log('[사람인] ⚠️  현재 봇 차단으로 수집 불가 (준비 중)');
  return [];
}
