import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import customAxios, { isAxiosError } from "../api/axiosInstance";
import LectureEditorForm from "../components/LecturePage/LectureEditorForm";
import {
  INITIAL_LECTURE_FORM_ERRORS,
  INITIAL_LECTURE_FORM_VALUE,
} from "../constants/lectureForm";
import type { LectureFormErrors, LectureFormValue } from "../types/LectureForm";
import type { User } from "../types/User";
import { collectUniqueLectureCategories } from "../utils/lectureFormUtils";

type LectureUpdateFormProps = {
  user: User | null;
};

function LectureUpdateForm({ user }: LectureUpdateFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  // 이 페이지는 관리자 전용이다. 일반 사용자는 메인 또는 로그인 화면으로 돌려보낸다.
  useEffect(() => {
    if (user?.role !== "ADMIN") {
      alert("관리자만 접근할 수 있는 페이지입니다.");
      navigate(user ? "/" : "/members/login");
    }
  }, [user, navigate]);

  const [lecture, setLecture] = useState<LectureFormValue>(
    INITIAL_LECTURE_FORM_VALUE
  );
  const [errors, setErrors] = useState<LectureFormErrors>(
    INITIAL_LECTURE_FORM_ERRORS
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    customAxios
      .get("/api/lecture/list")
      .then((response) => {
        setCategories(collectUniqueLectureCategories(response.data));
      })
      .catch((error) => {
        console.log(`대주제 목록 불러오기 실패 : ${error}`);
      });
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }

    customAxios
      .get<LectureFormValue>(`/api/lecture/update/${id}`)
      .then((response) => {
        setLecture(response.data);
        setSelectedCategory(response.data.category);
      })
      .catch((error) => {
        console.log(`강의 ${id}번 오류 발생 : ${error}`);
        alert("해당 강의 정보를 읽어 오지 못했습니다.");
      });
  }, [id]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    setSelectedCategory(value);
    setLecture({
      ...lecture,
      category: value === "custom" ? "" : value,
    });
  };

  const handleFieldChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setLecture({
      ...lecture,
      [name]: value,
    });
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      alert("수정할 강의 번호가 없습니다.");
      return;
    }

    try {
      await customAxios.put(`/api/lecture/update/${id}`, lecture, {
        headers: { "Content-Type": "application/json" },
      });

      alert("강의가 성공적으로 수정되었습니다.");
      setLecture(INITIAL_LECTURE_FORM_VALUE);
      setErrors(INITIAL_LECTURE_FORM_ERRORS);
      setSelectedCategory("");
      navigate("/lecture/list");
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        setErrors((prev) => ({
          ...prev,
          ...error.response?.data?.errors,
          general:
            error.response?.data?.message || "강의 수정 중 오류가 발생했습니다.",
        }));
        return;
      }

      setErrors((prev) => ({
        ...prev,
        general: "서버와의 통신 중 오류가 발생했습니다.",
      }));
    }
  };

  return (
    <LectureEditorForm
      title="강의 수정"
      description="기존 강의 정보를 수정합니다."
      lecture={lecture}
      errors={errors}
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/lecture/list")}
    />
  );
}

export default LectureUpdateForm;
