/**
 * 표준 채용 공고 데이터 인터페이스
 */
export interface JobPosting {
  id: string;           // 고유 식별자
  platform: string;     // 출처
  company: string;      // 회사명
  title: string;        // 공고 제목
  location: string;     // 근무 지역
  experience: string;   // 요구 경력
  techStacks: string[]; // 기술 스택 배열
  url: string;          // 원본 공고 링크
  deadline: string;     // 마감일
  postedAt?: string;    // 등록일
}

export interface ScrapeResponse {
  success: boolean;
  data: JobPosting[];
  error?: string;
  timestamp: string;
}
