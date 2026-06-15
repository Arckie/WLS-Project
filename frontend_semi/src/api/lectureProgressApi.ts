import customAxios from "./axiosInstance";

export interface LectureProgressRecentDto {
  lectureId: number;
  lectureName: string;
  lastViewedAt: string;
  viewCount: number;
}

export const recordLectureView = async (
  lectureId: number
): Promise<void> => {
  await customAxios.post(`/api/lecture/list/progress/${lectureId}`);
};

export const getRecentLecture = async (): Promise<LectureProgressRecentDto | null> => {
  const response = await customAxios.get<LectureProgressRecentDto>(
    "/api/lecture/list/progress/recent-list",
    {
      validateStatus: (status) => status === 200 || status === 204,
    }
  );

  if (response.status === 204) {
    return null;
  }

  return response.data;
};
