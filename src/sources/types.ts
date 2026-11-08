import { JobPosting, JobSource, UserCriteria } from '../types/job';

export interface SourceScraperModule {
  source: JobSource;
  // Simulates or performs live scraping/filtering for the specific target portal
  fetchPostings: (criteria?: Partial<UserCriteria>) => Promise<JobPosting[]>;
  checkHealth: () => Promise<{ isOnline: boolean; pingMs: number; lastChecked: string }>;
}
