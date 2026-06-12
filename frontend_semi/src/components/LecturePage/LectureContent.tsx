import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useNavigate } from "react-router-dom";
import customAxios from "../../api/axiosInstance";
import type { Lecture } from "../../types/Lecture";
import type { User } from "../../types/User";
import { getSyntaxThemeByLanguage } from "../../utils/lectureDisplayUtils";
import "./LectureContent.css";

type LectureContentProps = {
  currentLecture: Lecture | null;
  user: User | null;
  onDeleteLecture: (lectureId: number) => void;
};

function LectureContent({
  currentLecture,
  user,
  onDeleteLecture,
}: LectureContentProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"code" | "description">("code");

  /*
    선택된 강의가 바뀔 때마다 학습 기록을 저장합니다.
    URL로 바로 들어온 경우도 currentLecture가 세팅되므로 여기 한 곳에서 처리하면 됩니다.
  */
  useEffect(() => {
    if (!currentLecture?.id) {
      return;
    }

    customAxios
      .post(`/api/lecture/list/progress/${currentLecture.id}`)
      .catch((error) => {
        console.error("강의 열람 기록 저장 실패:", error);
      });
  }, [currentLecture?.id]);

  // 다른 강의를 선택하면 항상 "코드 예시" 탭부터 보여줍니다.
  useEffect(() => {
    setActiveTab("code");
  }, [currentLecture?.id]);

  const handleCopy = (text?: string) => {
    if (!text) {
      alert("복사할 내용이 없습니다.");
      return;
    }

    navigator.clipboard.writeText(text);
    alert("복사되었습니다!");
  };

  if (!currentLecture) {
    return (
      <main className="lecture-content">
        <div className="lecture-content-empty">
          강의실 목차에서 학습할 강의를 선택해 주세요.
        </div>
      </main>
    );
  }

  const isAdmin = user?.role === "ADMIN";
  const activeContent =
    activeTab === "code"
      ? currentLecture.code_example || ""
      : currentLecture.code_description || "";

  return (
    <main className="lecture-content">
      <nav className="lecture-breadcrumb-row">
        <div className="lecture-breadcrumb">
          강의실 &gt; {currentLecture.category} &gt;{" "}
          <span>{currentLecture.name}</span>
        </div>

        {/* 관리자에게만 강의 수정/삭제 버튼을 보여줍니다. */}
        {isAdmin && (
          <div className="lecture-admin-area">
            <div className="lecture-admin-buttons">
              <button
                type="button"
                className="lecture-admin-button edit"
                onClick={() =>
                  navigate(`/lecture/update/${currentLecture.id}`)
                }
              >
                수정
              </button>

              <button
                type="button"
                className="lecture-admin-button delete"
                onClick={() => onDeleteLecture(currentLecture.id)}
              >
                삭제
              </button>
            </div>
          </div>
        )}
      </nav>

      <section className="lecture-hero-card">
        <div className="lecture-hero-left">
          <div className="lecture-icon-box">&lt;/&gt;</div>

          <div className="lecture-title-box">
            <p className="lecture-badge">LECTURE</p>
            <h1>{currentLecture.name}</h1>

            <p className="lecture-category-text">
              <strong>{currentLecture.category}</strong>
            </p>

            <div className="lecture-description-text">
              {currentLecture.lecture_description || "강의 설명이 없습니다."}
            </div>
          </div>
        </div>

        <div className="lecture-hero-symbol">💻</div>
      </section>

      <section className="lecture-workspace">
        <div className="lecture-code-card">
          <div className="lecture-tab-row">
            {/* activeTab 값에 따라 코드 예시와 코드 설명 중 하나만 보여줍니다. */}
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={
                activeTab === "code"
                  ? "lecture-tab-button active"
                  : "lecture-tab-button"
              }
            >
              🖥️ 코드 예시
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={
                activeTab === "description"
                  ? "lecture-tab-button active"
                  : "lecture-tab-button"
              }
            >
              📖 코드 설명
            </button>
          </div>

          <div className="lecture-code-body">
            <div className="lecture-code-toolbar">
              <span>
                📄{" "}
                {activeTab === "code"
                  ? currentLecture.language?.toUpperCase() || "CODE"
                  : "DESCRIPTION"}
              </span>

              <button
                type="button"
                className="lecture-copy-button"
                onClick={() => handleCopy(activeContent)}
              >
                📋 복사
              </button>
            </div>

            <div className="lecture-code-viewer">
              {activeContent ? (
                <SyntaxHighlighter
                  language={
                    activeTab === "code"
                      ? currentLecture.language?.toLowerCase()
                      : "text"
                  }
                  style={getSyntaxThemeByLanguage(
                    activeTab === "code" ? currentLecture.language || "" : "text"
                  )}
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    backgroundColor: "transparent",
                    fontSize: "14px",
                    lineHeight: "1.65",
                    minHeight: "100%",
                    height: "100%",
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily:
                        '"Consolas", "Monaco", "Courier New", monospace',
                    },
                  }}
                >
                  {activeContent}
                </SyntaxHighlighter>
              ) : (
                <div className="lecture-code-empty">표시할 내용이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LectureContent;
