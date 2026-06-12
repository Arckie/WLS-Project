import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { User } from "../../types/User";

interface ProtectedLayoutProps {
  user: User | null;
}

function ProtectedLayout({ user: _user }: ProtectedLayoutProps) {
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
    화면 접근 권한은 user 객체보다 accessToken을 기준으로 판단합니다.
    user만 남고 token이 지워진 상태를 로그인으로 보면 무한 리다이렉트가 생길 수 있습니다.

    토큰을 검사해서 없으면 로그인 페이지로 보내는 공통 함수입니다.
    useEffect 안에서도, 뒤로가기/캐시 복원 이벤트에서도 똑같이 재사용합니다.
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

    return true;
  };

  useEffect(() => {
    // 페이지에 들어온 시점에 일단 한 번 토큰 검사
    guard();

    /*
      뒤로가기/앞으로가기(popstate)를 눌렀을 때 다시 토큰 검사합니다.
      로그아웃 후 뒤로가기로 보호 페이지에 돌아오려는 시도를 막아줍니다.
    */
    const handlePopState = () => {
      guard();
    };

    /*
      브라우저가 화면을 캐시(bfcache)에서 그대로 복원할 때는
      React가 다시 실행되지 않아 위 useEffect가 안 돌 수 있습니다.
      event.persisted가 true면 캐시에서 복원된 것이므로 강제로 다시 검사합니다.
    */
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        guard();
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);

    // 컴포넌트가 사라질 때 등록했던 이벤트를 정리(해제)합니다.
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [location.pathname, location.search]);

  /*
    렌더링 시점에도 토큰이 없으면 보호 화면 자체를 그리지 않습니다.
    (캐시 화면이 잠깐 보이는 깜빡임을 줄여줍니다.)
  */
  const token = localStorage.getItem("accessToken");
  if (token === null) {
    return null;
  }

  return <Outlet />;
}

export default ProtectedLayout;