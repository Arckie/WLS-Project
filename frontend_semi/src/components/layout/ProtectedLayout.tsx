import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../../types/User";

interface ProtectedLayoutProps {
  user: User | null;
}

function ProtectedLayout({ user: _user }: ProtectedLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("accessToken");
  const signOffAt = Number(sessionStorage.getItem("memberSignOffAt"));
  const isMemberSignOffRedirecting =
    Number.isFinite(signOffAt) && Date.now() - signOffAt < 5000;

  /*
    화면 접근 권한은 user 객체보다 accessToken을 기준으로 판단합니다.
    user만 남고 token이 지워진 상태를 로그인으로 보면 무한 리다이렉트가 생길 수 있습니다.
  */
  const isLoggedIn = token !== null;

  useEffect(() => {
    if (!isLoggedIn) {
      if (!isMemberSignOffRedirecting) {
        alert("로그인이 필요합니다.");
      }

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

  return <Outlet />;
}

export default ProtectedLayout;
