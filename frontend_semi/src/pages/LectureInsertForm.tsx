import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import customAxios, { isAxiosError } from "../api/axiosInstance";
import LectureEditorForm from "../components/LecturePage/LectureEditorForm";
import {
  INITIAL_LECTURE_FORM_ERRORS,
  INITIAL_LECTURE_FORM_VALUE,
} from "../constants/lectureForm";
import type { LectureFormErrors, LectureFormValue } from "../types/LectureForm";
import type { User } from "../types/User";
import { collectUniqueLectureCategories } from "../utils/lectureFormUtils";
import "./LectureInsertForm.css";

type LectureInsertFormProps = {
  user: User | null;
};

function LectureInsertForm({ user }: LectureInsertFormProps) {
  const navigate = useNavigate();

  // 이 페이지는 관리자 전용이다. 화면 접근은 프론트에서 먼저 막고,
  // 실제 운영에서는 백엔드 권한 검증도 함께 있어야 한다.
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

    try {
      await customAxios.post("/api/lecture/insert", lecture, {
        headers: { "Content-Type": "application/json" },
      });

      alert("강의가 등록되었습니다.");
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
            error.response?.data?.message || "강의 등록 중 오류가 발생했습니다.",
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
      title="강의 등록"
      description="새 강의의 대주제, 설명, 예제 코드, 해설을 입력합니다."
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

export default LectureInsertForm;
