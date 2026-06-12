import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "../types/User";

interface ProtectedRouteProps {
    user: User | null;
    children: ReactNode;
}

function ProtectedRoute({ user, children }: ProtectedRouteProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("accessToken");

    const isLoggedIn = user !== null || token !== null;

    useEffect(() => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");

            navigate("/members/login", {
                replace: true,
                state: {
                    from: location.pathname + location.search,
                },
            });
        }
    }, [isLoggedIn, navigate, location.pathname, location.search]);

    if (!isLoggedIn) {
        return null;
    }

    return <>{children}</>;
}

export default ProtectedRoute;