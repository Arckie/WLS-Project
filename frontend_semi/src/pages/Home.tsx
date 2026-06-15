import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import customAxios from "../api/axiosInstance";
import type { HomeLecture, HomeNotice, LectureCategorySummary } from "../types/Home";
import type { ProgressSummary, RecentLecture } from "../types/LearningProgress";
import { formatDateTime, formatMonthDay } from "../utils/dateUtils";
import { getProgressRate, sumLectureCount, sumViewedCount } from "../utils/progressUtils";
import { makePreviewText } from "../utils/textUtils";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const [notices, setNotices] = useState<HomeNotice[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(true);

  const [lectureCategories, setLectureCategories] = useState<LectureCategorySummary[]>([]);
  const [lectureLoading, setLectureLoading] = useState(true);

  const [recentLectures, setRecentLectures] = useState<RecentLecture[]>([]);
  const [progressSummaries, setProgressSummaries] = useState<ProgressSummary[]>([]);
  const [learningLoading, setLearningLoading] = useState(true);

  useEffect(() => {
    getRecentNotices();
    getLectureCategories();
    getLearningStatus();
  }, []);

  const getRecentNotices = async () => {
    try {
      const response = await customAxios.get("/api/notices");

      const sortedNotices = [...response.data].sort((a: HomeNotice, b: HomeNotice) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setNotices(sortedNotices);
    } catch (error) {
      console.error("홈 공지사항 조회 실패:", error);
    } finally {
      setNoticeLoading(false);
    }
  };

  const getLectureCategories = async () => {
    try {
      const response = await customAxios.get("/api/lecture/list");

      const lectures: HomeLecture[] = response.data || [];
      const categoryMap = new Map<string, LectureCategorySummary>();

      lectures.forEach((lecture) => {
        if (!lecture.category) {
          return;
        }

        const existingCategory = categoryMap.get(lecture.category);

        if (existingCategory) {
          categoryMap.set(lecture.category, {
            ...existingCategory,
            count: existingCategory.count + 1,
          });

          return;
        }

        categoryMap.set(lecture.category, {
          category: lecture.category,
          count: 1,
          firstLectureId: lecture.id,
        });
      });

      setLectureCategories(Array.from(categoryMap.values()));
    } catch (error) {
      console.error("홈 코스 조회 실패:", error);
    } finally {
      setLectureLoading(false);
    }
  };

  const getLearningStatus = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setRecentLectures([]);
      setProgressSummaries([]);
      setLearningLoading(false);
      return;
    }

    try {
      setLearningLoading(true);

      const [recentResponse, summaryResponse] = await Promise.all([
        customAxios.get("/api/lecture/list/progress/recent-list"),
        customAxios.get("/api/lecture/list/progress/summary"),
      ]);

      setRecentLectures(recentResponse.data || []);
      setProgressSummaries(summaryResponse.data || []);
    } catch (error) {
      console.error("홈 학습 현황 조회 실패:", error);
      setRecentLectures([]);
      setProgressSummaries([]);
    } finally {
      setLearningLoading(false);
    }
  };

  const handleMoveNotice = (noticeId?: number) => {
    if (noticeId) {
      navigate(`/notices?noticeId=${noticeId}`);
      return;
    }

    navigate("/notices");
  };

  const handleMoveLectureCategory = (category: LectureCategorySummary) => {
    navigate(`/lecture/list?lectureId=${category.firstLectureId}`);
  };

  const handleMoveLecture = (lectureId: number) => {
    navigate(`/lecture/list?lectureId=${lectureId}`);
  };

  const recentNotices = notices.slice(0, 3);
  const visibleRecentLectures = recentLectures.slice(0, 4);

  const totalViewedCount = sumViewedCount(progressSummaries);
  const totalLectureCount = sumLectureCount(progressSummaries);

  const totalProgressRate = getProgressRate(totalViewedCount, totalLectureCount);
  const latestLecture = recentLectures.length > 0 ? recentLectures[0] : null;

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-text">
          <h1>배움이 쉬워지는 온라인 학습 공간</h1>
          <p>
            강의 수강부터 학습자료 확인, 문제풀이까지
            <br />
            모든 학습 활동을 한 곳에서 시작하세요.
          </p>

          <div className="home-hero-buttons">
            <button
              type="button"
              className="home-primary-button"
              onClick={() => navigate("/lecture/list")}
            >
              ▶ 학습 시작
            </button>

            <button
              type="button"
              className="home-outline-button"
              onClick={() => navigate("/lecture/list")}
            >
              📖 강의 둘러보기
            </button>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="hero-illustration">
            <div className="hero-glow hero-glow-one" />
            <div className="hero-glow hero-glow-two" />

            <div className="hero-floating-badge badge-light">💡</div>
            <div className="hero-floating-badge badge-cap">🎓</div>

            <div className="hero-dashboard-card">
              <div className="hero-pie-chart">
                <span />
              </div>

              <div className="hero-chart-lines">
                <span />
                <span />
                <span />
              </div>

              <div className="hero-card-chip">TODAY</div>
            </div>

            <div className="hero-book-stack">
              <button type="button">HTML</button>
              <button type="button">JavaScript</button>
              <button type="button">Python</button>
            </div>

            <div className="hero-person">
              <div className="hero-person-head" />
              <div className="hero-person-neck" />
              <div className="hero-person-body" />
            </div>

            <div className="hero-laptop">
              <div className="hero-laptop-shine" />
            </div>

            <div className="hero-code-card">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>

      <section className="home-dashboard">
        <div className="home-card recommended-card">
          <div className="home-card-header">
            <h2>📚 코스</h2>

            <button
              type="button"
              className="home-small-link-button"
              onClick={() => navigate("/lecture/list")}
            >
              더보기 ›
            </button>
          </div>

          <div className="course-list">
            {lectureLoading ? (
              <div className="course-card">
                <div className="course-image course-html">...</div>

                <div className="course-info">
                  <h3>코스 목록을 불러오는 중입니다.</h3>
                  <p>잠시만 기다려 주세요.</p>
                </div>
              </div>
            ) : lectureCategories.length === 0 ? (
              <div className="course-card">
                <div className="course-image course-html">!</div>

                <div className="course-info">
                  <h3>등록된 코스가 없습니다.</h3>
                  <p>강의가 등록되면 이곳에 표시됩니다.</p>
                </div>
              </div>
            ) : (
              lectureCategories.map((category, index) => (
                <div
                  key={category.category}
                  className="course-card"
                  onClick={() => handleMoveLectureCategory(category)}
                >
                  <div
                    className={
                      index % 3 === 0
                        ? "course-image course-html"
                        : index % 3 === 1
                          ? "course-image course-js"
                          : "course-image course-python"
                    }
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="course-info">
                    <h3>{category.category}</h3>
                    <p>{category.count}개의 강의가 포함된 코스입니다.</p>

                    <div className="course-progress-row">
                      <div className="course-progress">
                        <span style={{ width: "100%" }} />
                      </div>

                      <strong>{category.count}강</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="home-card notice-card">
          <div className="home-card-header">
            <h2>🔔 공지사항</h2>

            <button
              type="button"
              className="home-small-link-button"
              onClick={() => navigate("/notices")}
            >
              더보기 ›
            </button>
          </div>

          <div className="notice-list">
            {noticeLoading ? (
              <div className="notice-item">
                <div>
                  <strong>공지사항을 불러오는 중입니다.</strong>
                  <p>잠시만 기다려 주세요.</p>
                </div>

                <span>-</span>
              </div>
            ) : recentNotices.length === 0 ? (
              <div className="notice-item">
                <div>
                  <strong>등록된 공지사항이 없습니다.</strong>
                  <p>새로운 공지가 등록되면 이곳에 표시됩니다.</p>
                </div>

                <span>-</span>
              </div>
            ) : (
              recentNotices.map((notice) => (
                <div
                  key={notice.noticeId}
                  className="notice-item"
                  onClick={() => handleMoveNotice(notice.noticeId)}
                >
                  <div>
                    <strong>{notice.title}</strong>
                    <p>{makePreviewText(notice.contents)}</p>
                  </div>

                  <span>{formatMonthDay(notice.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="home-card status-card">
          <div className="home-card-header">
            <h2>📊 나의 학습 현황</h2>

            {latestLecture ? (
              <button
                type="button"
                className="home-small-link-button"
                onClick={() => handleMoveLecture(latestLecture.lectureId)}
              >
                이어보기 ›
              </button>
            ) : (
              <button
                type="button"
                className="home-small-link-button"
                onClick={() => navigate("/lecture/list")}
              >
                강의보기 ›
              </button>
            )}
          </div>

          {learningLoading ? (
            <div className="home-learning-empty">
              학습 현황을 불러오는 중입니다.
            </div>
          ) : !localStorage.getItem("accessToken") ? (
            <div className="home-learning-empty">
              로그인 후 최근 학습 기록을 확인할 수 있습니다.
            </div>
          ) : recentLectures.length === 0 ? (
            <div className="home-learning-empty">
              아직 학습 기록이 없습니다. 강의를 열람하면 이곳에 표시됩니다.
            </div>
          ) : (
            <>
              <div className="home-learning-summary">
                <div>
                  <span>전체 진행률</span>
                  <strong>{totalProgressRate}%</strong>
                  <p>
                    {totalViewedCount}강 / {totalLectureCount}강 열람
                  </p>
                </div>

                <div>
                  <span>최근 학습 강의</span>
                  <strong>{latestLecture?.name}</strong>
                  <p>{latestLecture?.category}</p>
                </div>
              </div>

              <div className="home-learning-table">
                <div className="home-learning-header">
                  <span>강의명</span>
                  <span>대주제</span>
                  <span>횟수</span>
                  <span>이동</span>
                </div>

                {visibleRecentLectures.map((lecture) => (
                  <div key={lecture.lectureId} className="home-learning-row">
                    <div className="home-learning-name">
                      <span className="home-learning-icon">📘</span>

                      <div>
                        <strong>{lecture.name}</strong>
                        <em>{formatDateTime(lecture.lastViewedAt)}</em>
                      </div>
                    </div>

                    <div className="home-learning-category">
                      {lecture.category}
                    </div>

                    <div className="home-learning-count">
                      {lecture.viewCount}회
                    </div>

                    <div>
                      <button
                        type="button"
                        className="home-learning-mini-button"
                        onClick={() => handleMoveLecture(lecture.lectureId)}
                      >
                        보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
