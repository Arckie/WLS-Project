import type { ProgressSummary } from "../types/LearningProgress";

export const getProgressRate = (viewedCount: number, totalCount: number) => {
  if (!totalCount || totalCount <= 0) {
    return 0;
  }

  return Math.round((viewedCount / totalCount) * 100);
};

export const sumViewedCount = (items: ProgressSummary[]) => {
  return items.reduce((sum, item) => sum + item.viewedCount, 0);
};

export const sumLectureCount = (items: ProgressSummary[]) => {
  return items.reduce((sum, item) => sum + item.totalCount, 0);
};
