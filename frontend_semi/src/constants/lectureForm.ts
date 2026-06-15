import type { LectureFormErrors, LectureFormValue } from "../types/LectureForm";

export const INITIAL_LECTURE_FORM_VALUE: LectureFormValue = {
  category: "",
  name: "",
  lecture_description: "",
  code_example: "",
  code_description: "",
  language: "",
};

export const INITIAL_LECTURE_FORM_ERRORS: LectureFormErrors = {
  category: "",
  name: "",
  lecture_description: "",
  code_example: "",
  code_description: "",
  language: "",
  general: "",
};

export const LECTURE_LANGUAGE_OPTIONS = ["java", "typescript", "sql", "text"];
