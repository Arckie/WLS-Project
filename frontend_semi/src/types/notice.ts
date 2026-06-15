export type NoticeListDto = {
  noticeId: number;
  title: string;
  content?: string;
  isImportant: boolean;
  viewCount: number;
  createdAt: string;
  categoryId?: number;
  categoryName?: string;
  authorName?: string;
  hasFile?: boolean;
  attachmentUrl?: string;
  originalFileName?: string;
};

export type NoticeDetailDto = NoticeListDto & {
  content: string;
  updatedAt?: string;
};

export type NoticeFormData = {
  title: string;
  content: string;
  isImportant: boolean;
  isUpdate: boolean;
};

export type NoticePageType =
  | "all"
  | "important"
  | "update";