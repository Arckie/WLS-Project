import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import customAxios from "../../api/axiosInstance";
import type { Favorite } from "../../types/Favorite";
import type { Lecture } from "../../types/Lecture";
import type { User } from "../../types/User";
import {
    findFavoriteByLectureId,
    makeLectureFavoriteUrl,
} from "../../utils/lectureFavoriteUtils";
import {
    getLectureCategoryName,
    groupLecturesByCategory,
} from "../../utils/lectureListUtils";
import "./LectureSidebar.css";

type LectureSidebarProps = {
    lectures: Lecture[];
    setCurrentLecture: (lecture: Lecture) => void;
    currentLecture_id: number | null;
    user: User | null;
};

function LectureSidebar({
    lectures,
    setCurrentLecture,
    currentLecture_id,
    user,
}: LectureSidebarProps) {
    const navigate = useNavigate();

    /*
      openCategories는 어떤 대주제 폴더가 열려있는지 저장합니다.
      현재 구조는 한 번에 하나의 대주제만 열리도록 객체를 갈아끼우는 방식입니다.
    */
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [favorites, setFavorites] = useState<Favorite[]>([]);

    const groupedLectures = groupLecturesByCategory(lectures);
    const sortedCategoryNames = Object.keys(groupedLectures);

    useEffect(() => {
        getFavorites();
    }, []);

    /*
      URL query 또는 부모 상태로 선택된 강의가 바뀌면,
      그 강의가 들어있는 대주제 폴더를 자동으로 열어줍니다.
    */
    useEffect(() => {
        if (!currentLecture_id) {
            return;
        }

        const selectedLecture = lectures.find(
            (lecture) => lecture.id === currentLecture_id
        );

        if (!selectedLecture) {
            return;
        }

        setOpenCategories({
            [getLectureCategoryName(selectedLecture)]: true,
        });
    }, [currentLecture_id, lectures]);

    const getFavorites = async () => {
        try {
            const response = await customAxios.get("/api/favorites/me");

            setFavorites(response.data || []);
        } catch (error) {
            console.error("즐겨찾기 목록 조회 실패:", error);
        }
    };

    const toggleCategory = (categoryName: string) => {
        setOpenCategories((prev) => {
            const isCurrentlyOpen = !!prev[categoryName];

            return isCurrentlyOpen ? {} : { [categoryName]: true };
        });
    };

    const toggleFavorite = async (
        event: React.MouseEvent<HTMLButtonElement>,
        lecture: Lecture
    ) => {
        // 즐겨찾기 버튼 클릭이 강의 선택 버튼 클릭으로 전파되지 않도록 막습니다.
        event.stopPropagation();

        const existingFavorite = findFavoriteByLectureId(favorites, lecture.id);

        try {
            if (existingFavorite) {
                await customAxios.delete(
                    `/api/favorites/${existingFavorite.favoriteId}`
                );

                setFavorites((prev) =>
                    prev.filter(
                        (favorite) =>
                            favorite.favoriteId !== existingFavorite.favoriteId
                    )
                );

                return;
            }

            const response = await customAxios.post("/api/favorites", {
                favoriteUrl: makeLectureFavoriteUrl(lecture.id),
            });

            setFavorites((prev) => [...prev, response.data]);
        } catch (error) {
            console.error("즐겨찾기 처리 실패:", error);
            alert("즐겨찾기 처리에 실패했습니다.");
        }
    };

    const handleSelectLecture = (lecture: Lecture) => {
        setOpenCategories({
            [getLectureCategoryName(lecture)]: true,
        });

        /*
          실제 현재 강의 변경과 URL query 갱신은 부모(LecturePage)의 훅이 처리합니다.
          학습 기록 저장은 LectureContent에서 currentLecture 변경을 감지해 한 번만 처리합니다.
        */
        setCurrentLecture(lecture);
    };

    const handleLectureKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
        lecture: Lecture
    ) => {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }

        event.preventDefault();
        handleSelectLecture(lecture);
    };

    return (
        <aside className="lecture-sidebar">
            <div className="sidebar-dom sidebar-dom1">
                <div className="lecture-sidebar-header">
                    <div className="lecture-sidebar-title-row">
                        <div className="lecture-sidebar-title-icon">💻</div>
                        <h2 className="lecture-sidebar-title">강의 목록</h2>
                    </div>

                    <p className="lecture-sidebar-subtitle">
                        대주제를 열고 원하는 강의를 선택하세요.
                    </p>
                </div>
            </div>

            <div className="sidebar-dom sidebar-dom2">
                {sortedCategoryNames.length === 0 ? (
                    <div className="lecture-sidebar-empty">
                        등록된 강의가 없습니다.
                    </div>
                ) : (
                    sortedCategoryNames.map((categoryName) => {
                        const isOpen = !!openCategories[categoryName];

                        return (
                            <div
                                key={categoryName}
                                className={
                                    isOpen
                                        ? "lecture-category open"
                                        : "lecture-category"
                                }
                            >
                                <button
                                    type="button"
                                    className="lecture-category-button"
                                    onClick={() => toggleCategory(categoryName)}
                                >
                                    <span className="lecture-category-arrow">
                                        {isOpen ? "▾" : "▸"}
                                    </span>
                                    <span>🗂️</span>
                                    <span className="lecture-category-name">
                                        {categoryName}
                                    </span>
                                    <span className="lecture-category-count">
                                        {groupedLectures[categoryName].length}
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="lecture-list">
                                        {groupedLectures[categoryName].map(
                                            (lecture) => {
                                                const isActive =
                                                    lecture.id === currentLecture_id;
                                                const favorite =
                                                    findFavoriteByLectureId(
                                                        favorites,
                                                        lecture.id
                                                    );

                                                return (
                                                    <div
                                                        key={lecture.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        className={
                                                            isActive
                                                                ? "lecture-item active"
                                                                : "lecture-item"
                                                        }
                                                        onClick={() =>
                                                            handleSelectLecture(lecture)
                                                        }
                                                        onKeyDown={(event) =>
                                                            handleLectureKeyDown(
                                                                event,
                                                                lecture
                                                            )
                                                        }
                                                    >
                                                        <div className="lecture-item-row">
                                                            <span className="lecture-item-title">
                                                                ㄴ🧩{lecture.name}
                                                            </span>

                                                            <span className="lecture-item-right">
                                                                {isActive && (
                                                                    <span className="lecture-active-mark">
                                                                        현재
                                                                    </span>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        favorite
                                                                            ? "lecture-favorite-button filled"
                                                                            : "lecture-favorite-button empty"
                                                                    }
                                                                    onClick={(event) =>
                                                                        toggleFavorite(
                                                                            event,
                                                                            lecture
                                                                        )
                                                                    }
                                                                    title={
                                                                        favorite
                                                                            ? "즐겨찾기 해제"
                                                                            : "즐겨찾기 등록"
                                                                    }
                                                                >
                                                                    {favorite ? "★" : "☆"}
                                                                </button>
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {user?.role === "ADMIN" && (
                <div className="sidebar-dom sidebar-dom3">
                    <button
                        type="button"
                        className="lecture-create-button"
                        onClick={() => navigate("/lecture/insert")}
                    >
                        + 새 글 작성
                    </button>
                </div>
            )}
        </aside>
    );
}

export default LectureSidebar;
