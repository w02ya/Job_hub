export type Platform = '원티드' | '잡플래닛' | '링커리어';

export interface JobPosting {
  id: string;
  platform: Platform | string;
  company: string;
  title: string;
  location: string;
  experience: string;
  techStacks: string[];
  url: string;
  deadline: string;
  postedAt?: string;
}

export interface ScrapeResponse {
  success: boolean;
  data: JobPosting[];
  error?: string;
  timestamp: string;
}
