import "./MyPageSideBar.css";
import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "../../types/User";

interface MyPageSideBarProps {
    user?: User | null;
}

function MyPageSideBar({ user }: MyPageSideBarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const isMember = location.pathname === "/members/mypage";
    const isLearning = location.pathname === "/members/mypage/learning";
    const isFavorite = location.pathname === "/members/mypage/favorite";
    const isAdminPage = location.pathname === "/members/admin";

    const isAdmin = user?.role === "ADMIN";

    const bottomImage = isAdminPage
        ? "/mypage-admin.svg"
        : isMember
            ? "/mypage-profile.svg"
            : isLearning
                ? "/mypage-learning.svg"
                : isFavorite
                    ? "/mypage-favorite.svg"
                    : "/mypage-profile.svg";

    const bottomTitle = isAdminPage
        ? "ADMIN"
        : isMember
            ? "PROFILE"
            : isLearning
                ? "LEARNING-INFO"
                : isFavorite
                    ? "FAVORITE"
                    : "PROFILE";

    return (
        <aside className="mypage-sidebar">
            <div className="mypage-sidebar-header">
                <div className="mypage-sidebar-title-row">
                    <div className="mypage-sidebar-title-icon">👤</div>
                    <h2 className="mypage-sidebar-title">마이페이지</h2>
                </div>

                <p className="mypage-sidebar-subtitle">
                    내 학습 정보와 계정 정보를 관리하세요.
                </p>
            </div>

            <div className="mypage-sidebar-menu-list">
                {isAdmin && (
                    <button
                        type="button"
                        className={
                            isAdminPage
                                ? "mypage-menu active"
                                : "mypage-menu"
                        }
                        onClick={() => navigate("/members/admin")}
                    >
                        <span>00</span>
                          관리자 콘솔
                    </button>
                )}

                <button
                    type="button"
                    className={
                        isLearning
                            ? "mypage-menu active"
                            : "mypage-menu"
                    }
                    onClick={() => navigate("/members/mypage/learning")}
                >
                    <span>01</span>
                    학습정보
                </button>

                <button
                    type="button"
                    className={
                        isMember
                            ? "mypage-menu active"
                            : "mypage-menu"
                    }
                    onClick={() => navigate("/members/mypage")}
                >
                    <span>02</span>
                    회원정보
                </button>

                <button
                    type="button"
                    className={
                        isFavorite
                            ? "mypage-menu active"
                            : "mypage-menu"
                    }
                    onClick={() => navigate("/members/mypage/favorite")}
                >
                    <span>03</span>
                    즐겨찾기
                </button>
            </div>

            <div className="mypage-sidebar-guide">
                <p>ⓘ 내 학습과 계정 정보를</p>
                <p>한 곳에서 관리할 수 있습니다.</p>
            </div>

            <div className="mypage-sidebar-bottom">
                <img src={bottomImage} alt={bottomTitle} />
            </div>
        </aside>
    );
}

export default MyPageSideBar;