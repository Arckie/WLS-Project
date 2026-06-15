import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import customAxios from "../../api/axiosInstance";
import { Settings } from "lucide-react";
import { Alert } from "react-bootstrap";
import "./PasswordlessSetting.css";
import type { User } from "../../types/User";

// 화면 변환
type SetupStep = "input" | "loading" | "code";

interface Props {
    handleLoginSuccess?: (user: User) => void;
}

function PasswordlessSetting({ handleLoginSuccess }: Props) {
    // State
    const [loginId, setLoginId] = useState("");
    const [step, setStep] = useState<SetupStep>("input");
    const [errors, setErrors] = useState("");

    const [servicePassword, setServicePassword] = useState("");
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [serverUrl, setServerUrl] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [registerKey, setRegisterKey] = useState("");
    const [timeLeft, setTimeLeft] = useState(180);

    // 파생값
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isExpired = timeLeft <= 0;
    const timerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // 라우터
    const navigate = useNavigate();
    const location = useLocation();

    // LoginPage에서 state로 넘긴 mode
    // mode === "login"   → Passwordless 로그인
    // mode === "setting" → Passwordless 앱 등록
    const mode = location.state?.mode ?? "login";

    // crypto.randomUUID()가 환경에 따라 없을 수 있으므로 안전한 ID 생성 함수 사용
    const makeId = () => {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    };

    // 에러 메시지 추출
    const getErrorMessage = (error: any) => {
        const data = error.response?.data;

        if (typeof data === "string") {
            return data;
        }

        if (data?.message) {
            return data.message;
        }

        if (error.message) {
            return error.message;
        }

        return "서버와 연결할 수 없습니다.";
    };

    // 확인 버튼: 아이디 입력 → 코드 화면
    const handleConfirm = async (event?: React.SyntheticEvent) => {
        event?.preventDefault();

        const trimmedLoginId = loginId.trim();

        if (!trimmedLoginId) {
            setErrors("아이디를 입력해 주세요.");
            return;
        }

        setErrors("");
        setStep("loading");

        console.log("Passwordless handleConfirm 실행");
        console.log("현재 mode =", mode);
        console.log("입력 loginId =", trimmedLoginId);

        try {
            if (mode === "setting") {
                console.log("Passwordless setting 분기 진입");

                const response = await customAxios.post("/api/passwordless/join-ap", {
                    userId: trimmedLoginId,
                });

                console.log("join-ap 응답:", response.data);

                const data = response.data?.data;

                if (!data) {
                    throw new Error("Passwordless 등록 응답 데이터가 비어 있습니다.");
                }

                setRegisterKey(data.registerKey ?? "");
                setQrDataUrl(data.qr ?? "");
                setServerUrl(data.serverUrl ?? "");
            } else {
                console.log("Passwordless login 분기 진입");

                const random = makeId();
                const newSessionId = makeId();

                console.log("생성 random =", random);
                console.log("생성 sessionId =", newSessionId);

                setSessionId(newSessionId);

                console.log("login-process Axios 호출 직전");

                const response = await customAxios.post("/api/passwordless/login-process", {
                    userId: trimmedLoginId,
                    random,
                    sessionId: newSessionId,
                });

                console.log("login-process 응답:", response.data);

                const data = response.data?.data;

                if (!data) {
                    throw new Error("Passwordless 로그인 응답 데이터가 비어 있습니다.");
                }

                setServicePassword(data.servicePassword ?? "");
            }

            setTimeLeft(180);
            setStep("code");
        } catch (error: any) {
            console.error("Passwordless 요청 실패:", error);

            setStep("input");
            setErrors(getErrorMessage(error));
        }
    };

    // 재발급 버튼
    const handleReissue = () => {
        handleConfirm();
    };

    // 확인 버튼: 코드 화면 → 승인 확인
    const handleResult = async () => {
        if (isExpired) {
            alert("인증 시간이 만료됐습니다. 다시 시도해주세요.");
            setStep("input");
            return;
        }

        try {
            if (mode === "setting") {
                alert("Passwordless 등록이 완료됐습니다!");
                navigate("/");
                return;
            }

            if (!sessionId) {
                alert("인증 세션 정보가 없습니다. 다시 시도해주세요.");
                setStep("input");
                return;
            }

            console.log("result Axios 호출");
            console.log("userId =", loginId.trim());
            console.log("sessionId =", sessionId);

            const response = await customAxios.post("/api/passwordless/result", {
                userId: loginId.trim(),
                sessionId,
            });

            console.log("result 응답:", response.data);

            const auth = response.data?.data?.auth;

            if (auth === "Y") {
                console.log("Passwordless 승인 완료. 내부 로그인 요청 시작");

                const loginResponse = await customAxios.post("/api/members/passwordless-login", {
                    userId: loginId.trim(),
                });

                console.log("passwordless-login 응답:", loginResponse.data);

                const { accessToken, ...userData } = loginResponse.data;

                localStorage.setItem("accessToken", accessToken);

                if (handleLoginSuccess) {
                    handleLoginSuccess(userData);
                }

                alert("로그인 성공! 환영합니다.");
                navigate("/");
            } else if (auth === "N") {
                alert("승인이 거부됐습니다. 다시 시도해주세요.");
                setStep("input");
            } else {
                alert("아직 승인 대기 중입니다. 앱에서 승인해주세요.");
            }
        } catch (error: any) {
            console.error("Passwordless 결과 확인 실패:", error);
            alert(getErrorMessage(error));
            setStep("input");
        }
    };

    // 타이머
    useEffect(() => {
        if (step !== "code" || timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [step, timeLeft]);

    return (
        <div className="passwordless-page">
            <div className="passwordless-box">
                <h1 className="passwordless-title">풀스택 강의실</h1>

                <p className="passwordless-subtitle">
                    {mode === "setting"
                        ? "Passwordless 앱 등록을 진행합니다."
                        : "Passwordless 로그인을 진행합니다."}
                </p>

                <div className="passwordless-form">
                    {/* 로딩 화면 */}
                    {step === "loading" && (
                        <div className="passwordless-loading">
                            <Settings
                                size={42}
                                color="#2d7cf6"
                                className="passwordless-loading-icon"
                            />
                            <p className="passwordless-loading-title">처리 중입니다.</p>
                            <p className="passwordless-loading-text">잠시만 기다려 주세요.</p>
                        </div>
                    )}

                    {/* 아이디 입력 화면 */}
                    {step === "input" && (
                        <>
                            {errors && <Alert variant="danger">{errors}</Alert>}

                            <label className="passwordless-label">아이디</label>
                            <input
                                className="passwordless-input"
                                type="text"
                                placeholder="아이디를 입력하세요."
                                value={loginId}
                                onChange={(event) => {
                                    setLoginId(event.target.value);
                                    if (errors) {
                                        setErrors("");
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleConfirm();
                                    }
                                }}
                            />

                            <label className="passwordless-label">비밀번호</label>
                            <input
                                className="passwordless-input"
                                type="password"
                                value=""
                                disabled
                            />

                            <button
                                className="passwordless-button"
                                onClick={handleConfirm}
                            >
                                {mode === "setting" ? "Passwordless 설정" : "Passwordless 로그인"}
                            </button>

                            <button
                                className="passwordless-cancel-button"
                                onClick={() => navigate("/members/login")}
                            >
                                취소
                            </button>

                            <p className="passwordless-signup-text">
                                아직 회원이 아니신가요?{" "}
                                <span
                                    className="passwordless-signup-link"
                                    onClick={() => navigate("/members/signup")}
                                >
                                    회원가입
                                </span>
                            </p>
                        </>
                    )}

                    {/* 코드 표시 화면 */}
                    {step === "code" && (
                        <>
                            {mode === "login" && (
                                <div className="phone-icon-box">📱</div>
                            )}

                            {mode === "setting" ? (
                                <>
                                    {qrDataUrl && (
                                        <div className="qr-container">
                                            <img
                                                src={qrDataUrl}
                                                alt="QR Code"
                                                className="passwordless-qr-image"
                                            />
                                        </div>
                                    )}

                                    <div className="passwordless-info-box">
                                        <p className="passwordless-loading-title">
                                            스마트폰 앱에서 아래 QR 코드를 스캔하세요.
                                        </p>

                                        <p>
                                            <strong>서버 URL</strong>
                                            <span>{serverUrl}</span>
                                        </p>

                                        <p>
                                            <strong>등록 코드</strong>
                                            <span>{registerKey}</span>
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="passwordless-loading-title">
                                        인증 번호 확인
                                    </p>

                                    <div className="auth-code-list">
                                        {servicePassword.split("").map((num, index) => (
                                            <div
                                                key={index}
                                                className="auth-code-display"
                                            >
                                                {num}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <p className={`auth-timer ${isExpired ? "auth-timer-expired" : ""}`}>
                                {isExpired
                                    ? "⏱ 인증 시간이 만료됐습니다."
                                    : `⏱ 남은 시간 ${timerText}`}
                            </p>

                            {isExpired && (
                                <button
                                    className="auth-reissue-button"
                                    onClick={handleReissue}
                                >
                                    인증번호 재발급
                                </button>
                            )}

                            <button
                                className="passwordless-button"
                                onClick={handleResult}
                                disabled={isExpired}
                                style={
                                    isExpired
                                        ? { opacity: 0.5, cursor: "not-allowed" }
                                        : {}
                                }
                            >
                                확인
                            </button>

                            <button
                                className="passwordless-cancel-button"
                                onClick={() => setStep("input")}
                            >
                                취소
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PasswordlessSetting;