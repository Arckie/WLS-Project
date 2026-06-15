import { Navigate, Outlet } from "react-router-dom";
import type { User } from "../../types/User";
import { isJwtExpired } from "../../utils/authUtils";

interface ProtectedLayoutProps {
    user: User | null;
}

function ProtectedLayout({ user }: ProtectedLayoutProps) {
    const token = localStorage.getItem("accessToken");

    /*
     * 핵심:
     * user state만 보고 막으면 안 됩니다.
     *
     * 새로고침하거나 /admin 같은 주소로 직접 접근하면
     * React의 user state는 처음에 null일 수 있습니다.
     *
     * 그래서 보호 라우트 접근 여부는 localStorage의 accessToken 기준으로 판단합니다.
     */
    if (!token) {
        return <Navigate to="/members/login" replace />;
    }

    if (isJwtExpired(token)) {
        localStorage.removeItem("accessToken");
        return <Navigate to="/members/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedLayout;