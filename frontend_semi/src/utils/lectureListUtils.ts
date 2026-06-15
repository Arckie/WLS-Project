import type { Lecture } from "../types/Lecture";

export const getLectureCategoryName = (lecture: Lecture) => {
  return lecture.category || "기타";
};

export const groupLecturesByCategory = (lectures: Lecture[]) => {
  const groupedLectures = lectures.reduce<Record<string, Lecture[]>>(
    (acc, lecture) => {
      const categoryName = getLectureCategoryName(lecture);

      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }

      acc[categoryName].push(lecture);

      return acc;
    },
    {}
  );

  Object.keys(groupedLectures).forEach((categoryName) => {
    groupedLectures[categoryName].sort((a, b) => a.id - b.id);
  });

  return groupedLectures;
};

export const findLectureByQuery = (lectures: Lecture[], search: string) => {
  const params = new URLSearchParams(search);
  const lectureIdParam = params.get("lectureId");
  const lectureId = lectureIdParam ? Number(lectureIdParam) : null;

  if (lectureId === null || Number.isNaN(lectureId)) {
    return null;
  }

  return lectures.find((lecture) => lecture.id === lectureId) || null;
};

export const pickNextCurrentLecture = (
  lectures: Lecture[],
  previousLecture: Lecture | null
) => {
  if (lectures.length === 0) {
    return null;
  }

  if (!previousLecture) {
    return lectures[0];
  }

  return (
    lectures.find((lecture) => lecture.id === previousLecture.id) || lectures[0]
  );
};
