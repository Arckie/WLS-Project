import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyPageSideBar from "../components/layout/MyPageSideBar";
import customAxios from "../api/axiosInstance";
import type { Favorite } from "../types/Favorite";
import { getFavoriteTitle } from "../utils/favoriteUtils";
import "./FavoritePage.css";

function FavoritePage() {
    const navigate = useNavigate();

    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    const getFavorites = async () => {
        try {
            const response = await customAxios.get("/api/favorites/me");

            console.log("즐겨찾기 목록:", response.data);

            setFavorites(response.data);
        } catch (error) {
            console.error("즐겨찾기 조회 실패:", error);
            alert("즐겨찾기 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getFavorites();
    }, []);

    const handleMoveFavorite = (favoriteUrl: string) => {
        navigate(favoriteUrl);
    };

    const handleDeleteFavorite = async (favoriteId: number) => {
        const isDelete = window.confirm("이 즐겨찾기를 삭제하시겠습니까?");

        if (!isDelete) {
            return;
        }

        try {
            await customAxios.delete(`/api/favorites/${favoriteId}`);

            alert("즐겨찾기가 삭제되었습니다.");

            setFavorites((prev) =>
                prev.filter((favorite) => favorite.favoriteId !== favoriteId)
            );
        } catch (error) {
            console.error("즐겨찾기 삭제 실패:", error);
            alert("즐겨찾기 삭제에 실패했습니다.");
        }
    };

   return (
    <div className="favorite-page">
        <MyPageSideBar />

        <main className="favorite-main">
            <section className="favorite-panel">
                <div className="favorite-header">
                    <div>
                        <p className="favorite-badge">FAVORITE</p>
                        <h1>즐겨찾기</h1>
                        <p>자주 보는 강의를 빠르게 이동할 수 있습니다.</p>
                    </div>

                    <button
                        type="button"
                        className="favorite-refresh-button"
                        onClick={getFavorites}
                    >
                        새로고침
                    </button>
                </div>

                <div className="favorite-table-wrap">
                    <div className="favorite-table-header">
                        <span>이름</span>
                        <span>위치</span>
                        <span>관리</span>
                    </div>

                    {loading ? (
                        <div className="favorite-empty-row">
                            즐겨찾기 목록을 불러오는 중입니다.
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className="favorite-empty-row">
                            저장한 즐겨찾기가 없습니다.
                        </div>
                    ) : (
                        favorites.map((favorite) => (
                            <div
                                key={favorite.favoriteId}
                                className="favorite-table-row"
                            >
                                <div className="favorite-name-cell">
                                    <span className="favorite-star">★</span>
                                    <strong>{getFavoriteTitle(favorite.favoriteUrl)}</strong>
                                </div>

                                <div className="favorite-url-cell">
                                    {favorite.favoriteUrl}
                                </div>

                                <div className="favorite-action-cell">
                                    <button
                                        type="button"
                                        className="favorite-mini-button primary"
                                        onClick={() =>
                                            handleMoveFavorite(favorite.favoriteUrl)
                                        }
                                    >
                                        이동
                                    </button>

                                    <button
                                        type="button"
                                        className="favorite-mini-button danger"
                                        onClick={() =>
                                            handleDeleteFavorite(favorite.favoriteId)
                                        }
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </main>
    </div>
);
}

export default FavoritePage;
