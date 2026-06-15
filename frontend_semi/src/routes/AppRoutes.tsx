import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import SignupTermsPage from "../pages/SignupTermsPage";
import SignupCompletePage from "../pages/SignupCompletePage";
import MyPage from "../pages/MyPage";
import LearningPage from "../pages/LearningPage";
import FavoritePage from "../pages/FavoritePage";
import LecturePage from "../pages/LecturePage";
import LectureInsertForm from "../pages/LectureInsertForm";
import LectureUpdateForm from "../pages/LectureUpdateForm";
import PublicLayout from "../components/layout/PublicLayout";
import ProtectedLayout from "../components/layout/ProtectedLayout";
import Introduce from "../pages/Introduce";
import NoticeContents from "../pages/NoticeContents";
import type { User } from "../types/User";
import HowToUse from "../pages/HowToUse";
import AdminPage from "../pages/AdminPage"; // YJ

interface AppProps {
    user: User | null;
    handleLoginSuccess: (userData: User) => void;
    handleLogout: (event?: React.MouseEvent<HTMLElement>) => void;
}
// TEST

function AppRoutes({ user, handleLoginSuccess, handleLogout }: AppProps) {
    return (
        <Routes>
            <Route element={<PublicLayout user={user} handleLogout={handleLogout} />}>
                {/* 공개 페이지 */}
                <Route path="/" element={<Home />} />
                <Route path="/introduce/" element={<Introduce />} />
                <Route path="/introduce/howtouse" element={<HowToUse />} />
                <Route path="/notices" element={<NoticeContents user={user} />} />

                {/* 로그인 / 회원가입 */}
                <Route path="/members/login" element={<LoginPage handleLoginSuccess={handleLoginSuccess} />} />
                <Route path="/members/signup" element={<SignupPage />} />
                <Route path="/signup/terms" element={<SignupTermsPage />} />
                <Route path="/signup/complete" element={<SignupCompletePage />} />

                {/* 로그인 필요 페이지 */}
                <Route element={<ProtectedLayout user={user} />}>
                    <Route path="/members/mypage" element={<MyPage handleLogout={handleLogout} />} />
                    <Route path="/members/mypage/favorite" element={<FavoritePage />} />
                    <Route path="/members/mypage/learning" element={<LearningPage />} />
                    <Route path="/lecture/list" element={<LecturePage user={user} />} />
                    <Route path="/lecture/insert" element={<LectureInsertForm user={user} />} />
                    <Route path="/lecture/update/:id" element={<LectureUpdateForm user={user} />} />

                     {/* 관리자 페이지 YJ*/}
                    <Route path="/admin" element={<AdminPage user={user}/>} />
                                       
                 </Route>

                {/* 정의되지 않은 주소로 접근하면 빈 화면 대신 홈으로 돌려보냅니다. */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes;
