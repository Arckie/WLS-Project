export type LectureFormValue = {
  category: string;
  name: string;
  lecture_description: string;
  code_example: string;
  code_description: string;
  language: string;
};

export type LectureFormErrors = LectureFormValue & {
  general: string;
};

export type LectureCategorySource = {
  category: string;
};
