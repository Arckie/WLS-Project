export type Notice = {
  noticeId: number;
  noticeCategoryId: number;
  noticeCategoryName: string;
  memberId: number;
  title: string;
  contents: string;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type NoticeFormData = {
  noticeCategoryId: number;
  title: string;
  contents: string;
  attachmentUrl: string;
};

export type NoticeFormMode = "none" | "create" | "edit";
