import { useState } from "react";
import { useNavigate } from "react-router-dom";
import customAxios from "../api/axiosInstance";
import "./LoginPage";
import type { LoginResponse, User } from "../types/User";
import { Alert } from "react-bootstrap";
import {
  ShieldCheck,
  Settings
} from "lucide-react";

interface AppRoutesProps {
    // App.tsx -> AppRoutes.tsx를 거쳐온 프롭스(정보가 들어오면 App.tsx에 데이터를 보내야함)
    // onLogin 프롭스는 User 형식으로 매개 변수를 받고, 반환 타입이 없습니다.
    handleLoginSuccess: (user: User) => void;
}

function LoginPage({ handleLoginSuccess }: AppRoutesProps) {
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");

    // 에러 관련 메시지
    const [errors, setErrors] = useState('');

    const navigate = useNavigate();


    const handleLogin = async (event?: React.SyntheticEvent) => {
        event?.preventDefault(); // 새로고침 방지
        console.log('로그인 시도중입니다.');

        try {
            const url = "/members/login";
            const params = { loginId, password }; // 파라미터
            const config = {
                headers: { // 헤더에 MIME type 적어서 요청
                    "Content-Type": "application/json"
                }
            };

            const response = await customAxios.post<LoginResponse>(url, params, config);

            console.log('응답 데이터 : \n' + response.data);

            // 서버의 응답을 전개 연산자로 처리합니다.
            // accessToken는 JWT, userData는 User.ts으로 구성된 객체
            // accessToken은 변수로 가져오고 ...userData는 객체로 가져옴
            const { accessToken, ...userData } = response.data;

            // localStorage에는 문자열만 들어갈 수 있음
            // 전개 연산자로 변수로 가져온 accessToken은 바로 넣을 수 있음
            localStorage.setItem("accessToken", accessToken);

            console.log('로그인 성공 사용자 : ' + userData);

            // 함수를 조건식에 넣는 것은 존재 유무를 판별하려고
            // (프롭스로 진짜 받아온 함수인가정도를 판단함)
            if (handleLoginSuccess) {
                handleLoginSuccess(userData);

                // userData는 자바스크립트 객체여서 문자열로 바꿔줘야 함
                // JSON.stringify 함수는 JavaScript 객체를 JSON 문자열로 변환해 줍니다.
                // App.tsx에서 로컬스토리지에 저장할 예정이라 여기서는 안해도 됨
                // 이제 로컬용이 아니고 배포도 해야해서 로컬스토리지에서 user 정보 보여주지 않음
                // localStorage.setItem("user", JSON.stringify(userData));
            }

            // 로그인이 되면 메인 홈페이지로 이동시킴
            navigate("/");

        } catch (error: any) {
            if (error.response) { // 서버가 에러 응답을 보냈을때
                // 백엔드에서 작성한 에러 메시지
                setErrors(error.response.data.message || "로그인 실패");
            } else { // 서버가 에러 응답을 안보냈을때 - 네트워크 문제
                setErrors("Server Error");
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h1 className="login-title">풀스택 강의실</h1>
                <p className="login-subtitle">로그인 후 강의를 이용할 수 있습니다.</p>

                <div className="login-form">
                    {errors && <Alert variant="danger">{errors}</Alert>}

                    <label className="login-label">아이디</label>
                    <input
                        className="login-input"
                        type="text"
                        placeholder="아이디를 입력하세요."
                        value={loginId}
                        onChange={(event) => setLoginId(event.target.value)}
                    />
                    <label className="login-label">비밀번호</label>
                    <input
                        className="login-input"
                        type="password"
                        placeholder="비밀번호를 입력하세요."
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                handleLogin();
                            }
                        }}
                    />

                    <button className="login-button" onClick={handleLogin}>로그인</button>
                    <p className="login-signup-text">
                        아직 회원이 아니신가요?{" "}
                        <span className="login-signup-link" onClick={() => navigate("/members/signup")}>
                            회원가입
                        </span>
                    </p>

                    <div className="login-divider">
                      <span></span>
                      <p>또는</p>
                      <span></span>
                    </div>

                   <button className="passwordless-login-button"
                   onClick={() =>  navigate("/members/login/passwordlessSetting",
                  { state: { mode: "login" } })}>
                     <ShieldCheck />
                     Passwordless 로그인
                   </button>

                   <button className="passwordless-setting-button"
                   onClick={() => navigate("/members/login/passwordlessSetting",
                   { state: { mode: "setting" } })}>
                     <Settings />
                     Passwordless 설정
                   </button>


                </div>
            </div>
        </div>
    );
}

export default LoginPage;
