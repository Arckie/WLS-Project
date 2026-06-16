import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyPageSideBar from "../components/layout/MyPageSideBar";
import customAxios from "../api/axiosInstance";
import type { ProgressSummary, RecentLecture } from "../types/LearningProgress";
import { formatDateTime } from "../utils/dateUtils";
import { getProgressRate, sumLectureCount, sumViewedCount } from "../utils/progressUtils";
import "./LearningPage.css";

function LearningPage() {
    const navigate = useNavigate();

    const [recentLectures, setRecentLectures] = useState<RecentLecture[]>([]);
    const [progressSummaries, setProgressSummaries] = useState<ProgressSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const RECENT_LECTURES_URL = "/api/lecture/list/progress/recent-list";
    const PROGRESS_SUMMARY_URL = "/api/lecture/list/progress/summary";

    useEffect(() => {
        getLearningInfo();
    }, []);

    const getLearningInfo = async () => {
        try {
            setLoading(true);

            const [recentResponse, summaryResponse] = await Promise.all([
                customAxios.get(RECENT_LECTURES_URL),
                customAxios.get(PROGRESS_SUMMARY_URL),
            ]);

          //  console.log("최근 학습 정보:", recentResponse.data);
          //  console.log("대주제별 학습 진도:", summaryResponse.data);

            setRecentLectures(recentResponse.data || []);
            setProgressSummaries(summaryResponse.data || []);
        } catch (error) {
            console.error("학습정보 조회 실패:", error);
            alert("학습정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const totalViewedCount = sumViewedCount(progressSummaries);
    const totalLectureCount = sumLectureCount(progressSummaries);

    const totalProgressRate = getProgressRate(totalViewedCount, totalLectureCount);

    const totalViewCount = recentLectures.reduce(
        (sum, item) => sum + item.viewCount,
        0
    );

    const latestLecture = recentLectures.length > 0 ? recentLectures[0] : null;

    const visibleRecentLectures = recentLectures.slice(0, 6);

    const handleMoveLecture = (lectureId: number) => {
        navigate(`/lecture/list?lectureId=${lectureId}`);
    };

    return (
        <div className="learning-page">
            <MyPageSideBar />

            <main className="learning-main">
                <section className="learning-card">
                    <div className="learning-layout">
                        <div className="learning-content">
                            <div className="learning-header">
                                <p className="learning-badge">LEARNING</p>
                                <h1>학습정보</h1>
                                <p>
                                    내가 학습한 강의 기록과 대주제별 완료도를 확인할 수 있습니다.
                                </p>
                            </div>

                            {loading ? (
                                <div className="learning-empty">
                                    학습정보를 불러오는 중입니다.
                                </div>
                            ) : (
                                <>
                                    <div className="learning-summary-grid">
                                        <div className="learning-summary-card">
                                            <span>전체 진행률</span>
                                            <strong>{totalProgressRate}%</strong>
                                            <p>
                                                {totalViewedCount}강 / {totalLectureCount}강 열람
                                            </p>
                                        </div>

                                        <div className="learning-summary-card">
                                            <span>최근 학습 강의</span>
                                            <strong>
                                                {latestLecture ? latestLecture.name : "기록 없음"}
                                            </strong>
                                            <p>
                                                {latestLecture
                                                    ? `${latestLecture.category} · ${formatDateTime(
                                                          latestLecture.lastViewedAt
                                                      )}`
                                                    : "아직 열람한 강의가 없습니다."}
                                            </p>
                                        </div>

                                        <div className="learning-summary-card">
                                            <span>누적 열람 횟수</span>
                                            <strong>{totalViewCount}회</strong>
                                            <p>최근 학습 기록 기준 열람 횟수입니다.</p>
                                        </div>
                                    </div>

<div className="learning-detail-grid">
    <div className="learning-section learning-progress-section">
        <div className="learning-section-title">
            <h2>대주제별 완료도</h2>

            <button
                type="button"
                className="learning-small-button secondary"
                onClick={getLearningInfo}
            >
                새로고침
            </button>
        </div>

        <div className="learning-progress-list">
            {progressSummaries.length === 0 ? (
                <div className="learning-empty-row">
                    대주제별 학습 기록이 없습니다.
                </div>
            ) : (
                progressSummaries.map((summary) => {
                    const rate =
                        summary.progressRate ??
                        getProgressRate(summary.viewedCount, summary.totalCount);

                    return (
                        <div
                            key={summary.category}
                            className="learning-progress-item"
                        >
                            <div className="learning-progress-top">
                                <strong>{summary.category}</strong>

                                <span>
                                    {summary.viewedCount}강 / {summary.totalCount}강 · {rate}%
                                </span>
                            </div>

                            <div className="learning-progress-bar">
                                <span
                                    style={{
                                        width: `${rate}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </div>

    <div className="learning-section learning-recent-section">
        <div className="learning-section-title">
            <h2>최근 학습 활동</h2>

            {latestLecture && (
                <button
                    type="button"
                    className="learning-small-button primary"
                    onClick={() => handleMoveLecture(latestLecture.lectureId)}
                >
                    이어보기
                </button>
            )}
        </div>

        <div className="learning-recent-table">
            <div className="learning-recent-header">
                <span>강의명</span>
                <span>대주제</span>
                <span>횟수</span>
                <span>이동</span>
            </div>

            {recentLectures.length === 0 ? (
                <div className="learning-empty-row">
                    최근 학습 기록이 없습니다.
                </div>
            ) : (
                visibleRecentLectures.map((lecture) => (
                    <div
                        key={lecture.lectureId}
                        className="learning-recent-row"
                    >
                        <div className="learning-lecture-name">
                            <span className="learning-book-icon">📘</span>

                            <div className="learning-lecture-text">
                                <strong>{lecture.name}</strong>
                                <em>{formatDateTime(lecture.lastViewedAt)}</em>
                            </div>
                        </div>

                        <div className="learning-category">
                            {lecture.category}
                        </div>

                        <div className="learning-view-count">
                            {lecture.viewCount}회
                        </div>

                        <div>
                            <button
                                type="button"
                                className="learning-mini-button"
                                onClick={() => handleMoveLecture(lecture.lectureId)}
                            >
                                보기
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
</div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default LearningPage;
