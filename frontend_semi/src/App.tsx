import AppRoutes from "./routes/AppRoutes";
import "./components/layout/Header.css";
import { useState } from "react";
import type { User } from "./types/User";
import { useNavigate } from "react-router-dom";

function App() {
  // 로그인 안한 상태 : User는 null
  // 로그인 한 상태 : User는 값이 있음
  const [user, setUser] = useState<User | null>(null);
  const handleLoginSuccess = (userData: User) => { // LoginPage를 통해 로그인했을때 setUser 관리
    setUser(userData);
    console.log(userData);
    // 이제 로컬용이 아니고 배포도 해야해서 로컬스토리지에 유저 정보를 보여주지 않음
    // localStorage.setItem('user', JSON.stringify(userData));
    console.log('로그인 성공');
  }

  const navigate = useNavigate();

  // 로그인한 사용자가 '로그 아웃' 버튼을 클릭했습니다.
  const handleLogout = (event?: React.MouseEvent<HTMLElement>) => {
    // event가 없을 수도 있으니까
    event?.preventDefault();
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    // 로그아웃시 이동할 페이지 설정
    navigate(`/members/login`, { replace: true });
  };


  return (
    <>
      <AppRoutes user={user}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout} />
    </>
  );
}

export default App;

{/*
  페이지별 변동주기
    <aside className="sidebar">
      <div className="sidebar-dom sidebar-dom1">{dom1}</div>
      <div className="sidebar-dom sidebar-dom2">{dom2}</div>
      <div className="sidebar-dom sidebar-dom3">{dom3}</div>
    </aside>
*/}
