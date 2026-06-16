import type { NoticeFormData } from "../types/NoticePage";

export const NOTICE_CATEGORY_NAME_MAP: Record<number, string> = {
  1: "공지",
  2: "중요",
  3: "업데이트",
  4: "자료실",
};

export const INITIAL_NOTICE_FORM_DATA: NoticeFormData = {
  noticeCategoryId: 1,
  title: "",
  contents: "",
  attachmentUrl: "",
};

export const getNoticeCategoryTitle = (categoryId: number | null) => {
  if (categoryId === null) {
    return "전체공지";
  }

  return NOTICE_CATEGORY_NAME_MAP[categoryId] || "공지사항";
};

export const getNoticeCategoryDescription = (categoryId: number | null) => {
  if (categoryId === null) {
    return "풀스택 강의실의 전체 공지사항을 확인하세요.";
  }

  return `${getNoticeCategoryTitle(categoryId)} 게시판입니다.`;
};
