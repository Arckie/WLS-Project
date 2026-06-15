import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import customAxios from "../../api/axiosInstance";
import { Settings } from "lucide-react";
import { Alert } from "react-bootstrap";
import "./PasswordlessSetting.css";
import type { User } from "../../types/User";

// 화면 변환
type SetupStep = "input" | "loading" | "code";
interface Props { handleLoginSuccess?: (user: User) => void; }

function PasswordlessSetting({ handleLoginSuccess }: Props) {

    // State 
    const [loginId, setLoginId]               = useState("");
    const [step, setStep]                     = useState<SetupStep>("input");
    const [errors, setErrors]                 = useState("");
    const [servicePassword, setServicePassword] = useState("");
    const [sessionId, setSessionId]           = useState("");
    const [registerKey, setRegisterKey]       = useState("");
    const [timeLeft, setTimeLeft]             = useState(60);

    // 파생값 
    const minutes   = Math.floor(timeLeft / 60);
    const seconds   = timeLeft % 60;
    const isExpired = timeLeft <= 0;
    const timerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // 라우터 
    const navigate = useNavigate();
    const location = useLocation();
    const mode     = location.state?.mode ?? "login"; // "login" | "setting"

    // 확인 버튼 (아이디 입력 → 코드 화면으로) 
    const handleConfirm = async (event?: React.SyntheticEvent) => {
        event?.preventDefault();
        if (!loginId.trim()) { setErrors("아이디를 입력해 주세요."); return; }

        setErrors("");
        setStep("loading");

        try {
            if (mode === "setting") {
                const response = await customAxios.post("/passwordless/join-ap", { userId: loginId });
                setRegisterKey(response.data.data.registerKey);
            } else {
                const random       = crypto.randomUUID();
                const newSessionId = crypto.randomUUID();
                setSessionId(newSessionId);
                const response = await customAxios.post("/passwordless/login-process", {
                    userId: loginId, random, sessionId: newSessionId,
                });
                setServicePassword(response.data.data.servicePassword);
            }
            setTimeLeft(60);
            setStep("code");

        } catch (error: any) {
            setStep("input");
            const message = error.response?.data ?? error.response?.data?.message ?? "서버와 연결할 수 없습니다.";
            setErrors(typeof message === "string" ? message : "서버와 연결할 수 없습니다.");
        }
    };
    //  재발급 버튼 (타이머 만료 후 재시도) 
    const handleReissue = () => handleConfirm();

    // 확인 버튼 (코드 화면 → 승인 확인) 
    const handleResult = async () => {
        if (isExpired) { alert("인증 시간이 만료됐습니다. 다시 시도해주세요."); setStep("input"); return; }

        try {
            if (mode === "setting") {
                // 등록 완료 알림
                alert("Passwordless 등록이 완료됐습니다!");
                navigate("/");
                return;
            }

            const response = await customAxios.post("/passwordless/result", { userId: loginId, sessionId });
            const auth     = response.data.data?.auth;

            if (auth === "Y") {
                const loginResponse           = await customAxios.post("/members/passwordless-login", { userId: loginId });
                const { accessToken, ...userData } = loginResponse.data;
                localStorage.setItem("accessToken", accessToken);
                if (handleLoginSuccess) handleLoginSuccess(userData);
                // 추가: 로그인 성공 알림
                alert("로그인 성공! 환영합니다.");
                navigate("/");
            } else if (auth === "N") {
                alert("승인이 거부됐습니다. 다시 시도해주세요.");
                setStep("input");
            } else {
                alert("아직 승인 대기 중입니다. 앱에서 승인해주세요.");
            }

        } catch (error: any) {
            alert("오류가 발생했습니다. 다시 시도해주세요.");
            setStep("input");
        }
    };

    // 타이머 (code 화면일 때 1초씩 감소) 
    useEffect(() => {
        if (step !== "code" || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    //  렌더링 
    return (
        <div className="passwordless-page">
            <div className="passwordless-box">
                <h1 className="passwordless-title">풀스택 강의실</h1>
                <p className="passwordless-subtitle">
                    {mode === "setting" ? "Passwordless 앱 등록을 진행합니다." : "Passwordless 로그인을 진행합니다."}
                </p>

                <div className="passwordless-form">

                    {/*  로딩 화면  */}
                    {step === "loading" && (
                        <div className="passwordless-loading">
                            <Settings size={42} color="#2d7cf6" className="passwordless-loading-icon" />
                            <p className="passwordless-loading-title">처리 중입니다.</p>
                            <p className="passwordless-loading-text">잠시만 기다려 주세요.</p>
                        </div>
                    )}

                    {/*  아이디 입력 화면  */}
                    {step === "input" && (
                        <>
                            {errors && <Alert variant="danger">{errors}</Alert>}

                            <label className="passwordless-label">아이디</label>
                            <input
                                className="passwordless-input" type="text" placeholder="아이디를 입력하세요."
                                value={loginId} onChange={(e) => { setLoginId(e.target.value); if (errors) setErrors(""); }}
                            />

                            <label className="passwordless-label">비밀번호</label>
                            <input className="passwordless-input" type="password" value="" disabled />

                            <button className="passwordless-button" onClick={handleConfirm}>
                                {mode === "setting" ? "Passwordless 설정" : "Passwordless 로그인"}
                            </button>
                            <button className="passwordless-cancel-button" onClick={() => navigate("/members/login")}>취소</button>

                            <p className="passwordless-signup-text">
                                아직 회원이 아니신가요?{" "}
                                <span className="passwordless-signup-link" onClick={() => navigate("/members/signup")}>회원가입</span>
                            </p>
                        </>
                    )}

                    {/*  코드 표시 화면  */}
                    {step === "code" && (
                        <>
                            <div className="phone-icon-box">📱</div>

                            {/* setting: registerKey 박스 표시 / login: 숫자코드 한 글자씩 표시 */}
                            {mode === "setting" ? (
                                <>
                                    <p className="passwordless-loading-title">앱에서 아래 코드를 확인 후 승인하세요!</p>
                                    <div className="auth-register-key">{registerKey}</div>
                                </>
                            ) : (
                                <>
                                    <p className="passwordless-loading-title">인증 번호 확인</p>
                                    <div className="auth-code-list">
                                        {servicePassword.split("").map((num, index) => (
                                            <div key={index} className="auth-code-display">{num}</div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* 타이머: 남은시간 or 만료 메시지 */}
                            <p className={`auth-timer ${isExpired ? "auth-timer-expired" : ""}`}>
                                {isExpired ? "⏱ 인증 시간이 만료됐습니다." : `⏱ 남은 시간 ${timerText}`}
                            </p>

                            {/* 재발급 버튼: 만료됐을 때만 표시 */}
                            {isExpired && (
                                <button className="auth-reissue-button" onClick={handleReissue}>인증번호 재발급</button>
                            )}

                            <button
                                className="passwordless-button" onClick={handleResult} disabled={isExpired}
                                style={isExpired ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                            >확인</button>
                            <button className="passwordless-cancel-button" onClick={() => setStep("input")}>취소</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PasswordlessSetting;
