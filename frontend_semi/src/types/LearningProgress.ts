export type RecentLecture = {
  lectureId: number;
  category: string;
  name: string;
  viewCount: number;
  lastViewedAt: string;
};

export type ProgressSummary = {
  category: string;
  viewedCount: number;
  totalCount: number;
  progressRate?: number;
};
