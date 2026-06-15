import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../../types/User";
import { isJwtExpired } from "../../utils/authUtils";

interface ProtectedLayoutProps {
  user: User | null;
}

function ProtectedLayout({ user: _user }: ProtectedLayoutProps) {
  // AppRoutes에서 기존처럼 user를 넘겨도 TS6133 미사용 에러가 나지 않게 처리
  void _user;

  const navigate = useNavigate();
  const location = useLocation();

  /*
    회원탈퇴 직후 5초 동안은 "로그인이 필요합니다" alert를 띄우지 않기 위한 플래그입니다.
    탈퇴 처리 중에는 토큰이 사라지므로, 불필요한 경고창이 뜨는 것을 막아줍니다.
  */
  const signOffAt = Number(sessionStorage.getItem("memberSignOffAt"));
  const isMemberSignOffRedirecting =
    Number.isFinite(signOffAt) && Date.now() - signOffAt < 5000;

  /*
    보호 라우트 접근 여부는 user state가 아니라 accessToken 기준으로 판단합니다.
    새로고침이나 /admin 직접 접근 시 user는 잠깐 null일 수 있기 때문입니다.
  */
  const guard = () => {
    const token = localStorage.getItem("accessToken");

    if (token === null) {
      if (!isMemberSignOffRedirecting) {
        alert("로그인이 필요합니다.");
      }

      navigate("/members/login", {
        replace: true,
        state: {
          from: location.pathname + location.search,
        },
      });

      return false;
    }

    if (isJwtExpired(token)) {
      localStorage.removeItem("accessToken");

      if (!isMemberSignOffRedirecting) {
        alert("로그인 시간이 만료되었습니다. 다시 로그인해 주세요.");
      }

      navigate("/members/login", {
        replace: true,
        state: {
          from: location.pathname + location.search,
        },
      });

      return false;
    }

    return true;
  };

  useEffect(() => {
    guard();

    const handlePopState = () => {
      guard();
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        guard();
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [location.pathname, location.search]);

  /*
    렌더링 시점에도 토큰이 없거나 만료되었으면 보호 화면 자체를 그리지 않습니다.
    캐시 화면이나 보호 페이지가 잠깐 보이는 현상을 줄입니다.
  */
  const token = localStorage.getItem("accessToken");

  if (token === null) {
    return null;
  }

  if (isJwtExpired(token)) {
    return null;
  }

  return <Outlet />;
}

export default ProtectedLayout;