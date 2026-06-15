import type { LectureCategorySource } from "../types/LectureForm";

export const collectUniqueLectureCategories = (
  lectures: LectureCategorySource[]
) => {
  const categoryList = lectures.map((lecture) => lecture.category);

  return [...new Set<string>(categoryList)];
};
