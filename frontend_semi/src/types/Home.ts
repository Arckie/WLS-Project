export type HomeNotice = {
  noticeId: number;
  title: string;
  contents: string;
  attachmentUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type HomeLecture = {
  id: number;
  category: string;
  name: string;
  lecture_description?: string;
  language?: string;
  code_example?: string;
  code_description?: string;
  iframe_url?: string;
};

export type LectureCategorySummary = {
  category: string;
  count: number;
  firstLectureId: number;
};
