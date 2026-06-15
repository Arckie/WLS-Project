import LectureContent from "../components/LecturePage/LectureContent";
import LectureSidebar from "../components/layout/LectureSidebar";
import { useLecturePage } from "../hooks/useLecturePage";
import type { User } from "../types/User";
import "./LecturePage.css";

type LecturePageProps = {
    user: User | null;
};

function LecturePage({ user }: LecturePageProps) {
    /*
      useLecturePage는 강의 목록 조회, 현재 강의 선택, 강의 삭제를 담당합니다.
      이 페이지 파일은 "사이드바 + 본문"을 어떻게 배치할지만 보여주도록 가볍게 유지합니다.
    */
    const {
        lectures,
        currentLecture,
        loading,
        handleSetCurrentLecture,
        handleDeleteLecture,
    } = useLecturePage();

    if (loading) {
        return (
            <div className="lecture-page">
                <div className="lecture-main">
                    <div className="lecture-loading">강의 목록을 불러오는 중입니다.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="lecture-page">
            {/* 왼쪽 목차: 카테고리별 강의 목록과 즐겨찾기를 담당합니다. */}
            <LectureSidebar
                lectures={lectures}
                setCurrentLecture={handleSetCurrentLecture}
                currentLecture_id={currentLecture?.id || null}
                user={user}
            />

            {/* 오른쪽 본문: 선택된 강의의 설명/코드/관리자 버튼을 표시합니다. */}
            <LectureContent
                currentLecture={currentLecture}
                user={user}
                onDeleteLecture={handleDeleteLecture}
            />
        </div>
    );
}

export default LecturePage;
