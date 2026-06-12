import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import customAxios from "../api/axiosInstance";
import type { Lecture } from "../types/Lecture";
import {
  findLectureByQuery,
  pickNextCurrentLecture,
} from "../utils/lectureListUtils";

export function useLecturePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);

  const getLectureList = async () => {
    try {
      setLoading(true);

      const response = await customAxios.get("/api/lecture/list");
      const lectureList: Lecture[] = response.data || [];

      setLectures(lectureList);

      const queryLecture = findLectureByQuery(lectureList, location.search);

      if (queryLecture) {
        setCurrentLecture(queryLecture);
        return;
      }

      setCurrentLecture((prevLecture) =>
        pickNextCurrentLecture(lectureList, prevLecture)
      );
    } catch (error) {
      console.error("강의 목록 조회 실패:", error);
      alert("강의 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLectureList();
  }, [location.search]);

  const handleSetCurrentLecture = (lecture: Lecture) => {
    setCurrentLecture(lecture);

    navigate(`/lecture/list?lectureId=${lecture.id}`, {
      replace: false,
    });
  };

  const handleDeleteLecture = async (lectureId: number) => {
    const confirmDelete = window.confirm("정말 이 강의를 삭제하시겠습니까?");

    if (!confirmDelete) {
      return;
    }

    try {
      await customAxios.delete(`/api/lecture/delete/${lectureId}`);

      alert("강의가 삭제되었습니다.");

      navigate("/lecture/list", {
        replace: true,
      });

      await getLectureList();
    } catch (error) {
      console.error("강의 삭제 실패:", error);
      alert("강의 삭제에 실패했습니다.");
    }
  };

  return {
    lectures,
    currentLecture,
    loading,
    handleSetCurrentLecture,
    handleDeleteLecture,
  };
}
