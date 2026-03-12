/**
 * 더미 크롤러 뼈대
 * 각 함수는 실제 Playwright 크롤러로 교체 예정
 */
import { JobPosting } from '../../types/job';

// ────────────────────────────────────────
// 원티드 크롤러 뼈대
// ────────────────────────────────────────
export async function scrapeWanted(category: '프론트엔드' | '백엔드' = '프론트엔드'): Promise<JobPosting[]> {
  console.log(`[원티드] ${category} 공고 크롤링 시작...`);
  // TODO: Playwright로 https://www.wanted.co.kr 크롤링
  return DUMMY_WANTED;
}

// ────────────────────────────────────────
// 잡플래닛 크롤러 뼈대
// ────────────────────────────────────────
export async function scrapeJobplanet(): Promise<JobPosting[]> {
  console.log('[잡플래닛] 공고 크롤링 시작...');
  // TODO: Playwright로 https://www.jobplanet.co.kr 크롤링
  return DUMMY_JOBPLANET;
}

// ────────────────────────────────────────
// 링커리어 크롤러 뼈대
// ────────────────────────────────────────
export async function scrapeLinkareer(): Promise<JobPosting[]> {
  console.log('[링커리어] 공고 크롤링 시작...');
  // TODO: Playwright로 https://linkareer.com 크롤링
  return DUMMY_LINKAREER;
}

// ────────────────────────────────────────
// 전체 실행
// ────────────────────────────────────────
export async function scrapeAll(): Promise<JobPosting[]> {
  const [wanted, jobplanet, linkareer] = await Promise.all([
    scrapeWanted(),
    scrapeJobplanet(),
    scrapeLinkareer(),
  ]);
  return [...wanted, ...jobplanet, ...linkareer];
}

// ────────────────────────────────────────
// 더미 데이터
// ────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];

const DUMMY_WANTED: JobPosting[] = [
  {
    id: 'wanted-001',
    platform: '원티드',
    company: '(주)우아한형제들',
    title: '프론트엔드 시니어 개발자 (React/Next.js)',
    location: '서울 송파구',
    experience: '5년 이상',
    techStacks: ['React', 'TypeScript', 'Next.js'],
    url: 'https://www.wanted.co.kr/wd/1',
    deadline: '상시채용',
    postedAt: today,
  },
  {
    id: 'wanted-002',
    platform: '원티드',
    company: '카카오페이',
    title: '백엔드 개발자 (Node.js)',
    location: '경기 성남시',
    experience: '3년 이상',
    techStacks: ['Node.js', 'TypeScript', 'AWS'],
    url: 'https://www.wanted.co.kr/wd/2',
    deadline: '2026-04-30',
    postedAt: today,
  },
  {
    id: 'wanted-003',
    platform: '원티드',
    company: '토스',
    title: 'React Native 앱 개발자',
    location: '서울 강남구',
    experience: '2년 이상',
    techStacks: ['React Native', 'TypeScript'],
    url: 'https://www.wanted.co.kr/wd/3',
    deadline: '상시채용',
    postedAt: today,
  },
];

const DUMMY_JOBPLANET: JobPosting[] = [
  {
    id: 'jobplanet-001',
    platform: '잡플래닛',
    company: '당근마켓',
    title: '데이터 엔지니어 (Data Platform)',
    location: '서울 강남구',
    experience: '3년 이상',
    techStacks: ['Python', 'Spark', 'Kafka'],
    url: 'https://www.jobplanet.co.kr/job/1',
    deadline: '2026-05-15',
    postedAt: today,
  },
  {
    id: 'jobplanet-002',
    platform: '잡플래닛',
    company: '네이버',
    title: '풀스택 개발자 (Vue + Java)',
    location: '경기 성남시',
    experience: '신입/경력',
    techStacks: ['Vue', 'Java', 'Spring'],
    url: 'https://www.jobplanet.co.kr/job/2',
    deadline: '상시채용',
    postedAt: today,
  },
];

const DUMMY_LINKAREER: JobPosting[] = [
  {
    id: 'linkareer-001',
    platform: '링커리어',
    company: '라인플러스',
    title: '신입 iOS 개발자',
    location: '서울 마포구',
    experience: '신입',
    techStacks: ['Swift', 'UIKit'],
    url: 'https://linkareer.com/job/1',
    deadline: '2026-04-20',
    postedAt: today,
  },
  {
    id: 'linkareer-002',
    platform: '링커리어',
    company: '쿠팡',
    title: '백엔드 개발자 인턴십 (Kotlin)',
    location: '서울 강남구',
    experience: '신입',
    techStacks: ['Kotlin', 'Spring', 'MySQL'],
    url: 'https://linkareer.com/job/2',
    deadline: '2026-04-10',
    postedAt: today,
  },
];
