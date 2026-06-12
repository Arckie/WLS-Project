// PublicLayout.tsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import type { User } from "../../types/User";

interface AppRoutesProps { // App.tsx에서 온 프롭스 - LoginPage.tsx에 전달만 함
  user: User | null;
  handleLogout: (event?: React.MouseEvent<HTMLElement>) => void;
}

function PublicLayout({ user, handleLogout }: AppRoutesProps) {

  return (
    <div className="d-flex flex-column vh-100 overflow-hidden">
      <Header user={user} handleLogout={handleLogout} />
      {/* Header 아래 남은 공간 — 여기에 자식 라우트가 렌더링됨 / 자동으로 <Outlet /> 부분에 들어옴 */}
      <div className="flex-fill overflow-auto" style={{ minHeight: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default PublicLayout;