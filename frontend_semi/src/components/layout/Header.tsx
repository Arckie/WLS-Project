import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import logo from "../../icon/logo.svg";

import type { User } from "../../types/User";

import { isJwtExpired } from "../../utils/authUtils";

import "./Header.css";

type HeaderProps = {
  user: User | null;
  handleLogout: (event?: React.MouseEvent<HTMLElement>) => void;
};

function Header({ user, handleLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const introDropdownRef = useRef<HTMLDivElement | null>(null);

  const isMemberSignOffRedirecting = () => {
    const signOffAt = Number(sessionStorage.getItem("memberSignOffAt"));

    return Number.isFinite(signOffAt) && Date.now() - signOffAt < 5000;
  };

  // 대신해서 프롭스로 받은 handleLogout() 함수를 사용하면 됨
  // const clearExpiredSession = () => {
  //   localStorage.removeItem("accessToken");
  //   localStorage.removeItem("refreshToken");
  //   localStorage.removeItem("user");

  //   alert("로그인 시간이 만료되었습니다. 다시 로그인해 주세요.");

  //   window.location.replace("/members/login");
  // };

  // 위의 함수를 대신 할 함수 생성
  const handleSessionExpired = () => {
    alert("로그인 시간이 만료되었습니다. 다시 로그인해 주세요.");
    // 부모 handleLogout이 setUser(null) + localStorage 정리 + navigate를 모두 처리
    handleLogout();
  };

  const checkTokenExpired = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      if (user) {
        if (isMemberSignOffRedirecting()) {
          return;
        }

        handleSessionExpired();
      }

      return;
    }

    if (isJwtExpired(token)) {
      handleSessionExpired();
    }
  };

  const toggleIntroDropdown = () => {
    setIsIntroOpen((prev) => !prev);
  };

  const closeIntroDropdown = () => {
    setIsIntroOpen(false);
  };

  const moveToIntroduce = () => {
    closeIntroDropdown();
    navigate("/introduce");
  };

  const moveToHowToUse = () => {
    closeIntroDropdown();
    navigate("/introduce/howtouse");
  };

  useEffect(() => {
    checkTokenExpired();

    const intervalId = window.setInterval(() => {
      checkTokenExpired();
    }, 30000);

    const handleFocus = () => {
      checkTokenExpired();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, location.pathname]);

  /*
    소개 드롭다운은 기존 CSS hover만으로는 모바일 터치에서 안정적으로 열리지 않습니다.
    그래서 클릭/터치 기반 상태를 추가하고, 바깥 영역을 누르면 닫히도록 처리합니다.
  */
  useEffect(() => {
    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (
        introDropdownRef.current &&
        !introDropdownRef.current.contains(event.target as Node)
      ) {
        setIsIntroOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDownOutside);
    document.addEventListener("touchstart", handlePointerDownOutside);

    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside);
      document.removeEventListener("touchstart", handlePointerDownOutside);
    };
  }, []);

  /*
    라우트가 바뀌면 열린 소개 드롭다운을 닫습니다.
  */
  useEffect(() => {
    closeIntroDropdown();
  }, [location.pathname]);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="풀스택 강의실 로고" />
        </div>

        <nav className="header-left">
          <div
            className={
              isIntroOpen
                ? "custom-dropdown custom-dropdown-open"
                : "custom-dropdown"
            }
            ref={introDropdownRef}
          >
            <button
              type="button"
              className="header-button header-main-button"
              onClick={toggleIntroDropdown}
              aria-haspopup="menu"
              aria-expanded={isIntroOpen}
            >
              <span className="header-button-icon">▾</span>
              소개
            </button>

            <div className="custom-dropdown-menu">
              <button
                type="button"
                className="custom-dropdown-item"
                onClick={moveToIntroduce}
              >
                <span>📘</span>
                사이트 소개
              </button>

              <button
                type="button"
                className="custom-dropdown-item"
                onClick={moveToHowToUse}
              >
                <span>💡</span>
                이용 방법
              </button>
            </div>
          </div>

          {user && (
            <>
              <button
                type="button"
                className="header-button"
                onClick={() => navigate("/lecture/list")}
              >
                <span className="header-button-icon">▣</span>
                강의실
              </button>

              <button
                type="button"
                className="header-button"
                onClick={() => navigate("/notices")}
              >
                <span className="header-button-icon">▤</span>
                공지사항
              </button>
            </>
          )}
        </nav>

        <div className="header-right">
          {user ? (
            <>
              <button
                type="button"
                className="header-button"
                onClick={() => navigate("/members/mypage/favorite")}
              >
                <span className="header-button-icon">★</span>
                즐겨찾기
              </button>

              <button
                type="button"
                className="header-button header-user-button"
                onClick={() => {
                  navigate("/members/mypage/learning");
                }}
              >
                <span className="header-user-avatar">♙</span>
                {user.name}님
              </button>

              <button
                type="button"
                className="header-button"
                onClick={handleLogout}
              >
                <span className="header-button-icon">↪</span>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="header-button"
                onClick={() => navigate("/members/login")}
              >
                LOGIN
              </button>

              <button
                type="button"
                className="header-button header-signup-button"
                onClick={() => navigate("/signup/terms")}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;