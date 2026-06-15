import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Settings } from "lucide-react";
import { Alert } from "react-bootstrap";
import "./PasswordlessSetting.css";
import type { User } from "../../types/User";
import { API_BASE_URL } from "../../config/config";

type SetupStep = "input" | "loading" | "code";

interface Props {
    handleLoginSuccess?: (user: User) => void;
}

function PasswordlessSetting({ handleLoginSuccess }: Props) {
    const [loginId, setLoginId] = useState("");
    const [step, setStep] = useState<SetupStep>("input");
    const [errors, setErrors] = useState("");

    const [servicePassword, setServicePassword] = useState("");
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [serverUrl, setServerUrl] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [registerKey, setRegisterKey] = useState("");
    const [timeLeft, setTimeLeft] = useState(180);
    const [checkingResult, setCheckingResult] = useState(false);

    const resultStartedRef = useRef(false);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isExpired = timeLeft <= 0;
    const timerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const navigate = useNavigate();
    const location = useLocation();

    const mode = location.state?.mode ?? "login";

    const axiosConfig = {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        withCredentials: false,
    };

    const makeId = () => {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    };

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

    const handleConfirm = async (event?: React.SyntheticEvent) => {
        event?.preventDefault();

        const trimmedLoginId = loginId.trim();

        if (!trimmedLoginId) {
            setErrors("아이디를 입력해 주세요.");
            return;
        }

        setErrors("");
        setStep("loading");
        setCheckingResult(false);
        resultStartedRef.current = false;

        console.log("===== Passwordless handleConfirm 실행 =====");
        console.log("mode =", mode);
        console.log("loginId =", trimmedLoginId);

        try {
            if (mode === "setting") {
                console.log("Passwordless setting 분기 진입");

                const response = await axios.post(
                    `${API_BASE_URL}/api/passwordless/join-ap`,
                    {
                        userId: trimmedLoginId,
                    },
                    axiosConfig
                );

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

                console.log("random =", random);
                console.log("sessionId =", newSessionId);

                setSessionId(newSessionId);

                console.log("login-process Axios 호출 직전");

                const response = await axios.post(
                    `${API_BASE_URL}/api/passwordless/login-process`,
                    {
                        userId: trimmedLoginId,
                        random,
                        sessionId: newSessionId,
                    },
                    axiosConfig
                );

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

    const requestResult = async () => {
        if (resultStartedRef.current) {
            console.log("이미 result 대기 요청이 실행 중입니다.");
            return;
        }

        if (isExpired) {
            alert("인증 시간이 만료됐습니다. 다시 시도해주세요.");
            setStep("input");
            return;
        }

        if (mode !== "login") {
            return;
        }

        if (!sessionId) {
            console.log("sessionId가 아직 없습니다.");
            return;
        }

        const trimmedLoginId = loginId.trim();

        if (!trimmedLoginId) {
            console.log("loginId가 비어 있습니다.");
            return;
        }

        try {
            resultStartedRef.current = true;
            setCheckingResult(true);

            console.log("result 자동 대기 요청 시작");
            console.log("userId =", trimmedLoginId);
            console.log("sessionId =", sessionId);

            const response = await axios.post(
                `${API_BASE_URL}/api/passwordless/result`,
                {
                    userId: trimmedLoginId,
                    sessionId,
                },
                axiosConfig
            );

            console.log("result 응답:", response.data);

            /*
             * 백엔드가 auth == Y일 때 MemberLoginResponseDto를 바로 반환하는 구조 기준.
             * 즉 response.data.accessToken이 있으면 로그인 성공.
             */
            const accessToken = response.data?.accessToken;

            if (accessToken) {
                const { accessToken, ...userData } = response.data;

                localStorage.setItem("accessToken", accessToken);

                if (handleLoginSuccess) {
                    handleLoginSuccess(userData);
                }
                navigate("/");
                return;
            }

            /*
             * auth == N/W 같은 Passwordless 원본 응답을 반환하는 경우.
             */
            const auth = response.data?.data?.auth;

            if (auth === "N") {
                alert("승인이 거부됐습니다. 다시 시도해주세요.");
                setStep("input");
                return;
            }

            if (auth === "W") {
                alert("아직 승인 대기 중입니다. 다시 시도해주세요.");
                setStep("input");
                return;
            }

            alert("인증 상태를 확인할 수 없습니다. 다시 시도해주세요.");
            setStep("input");
        } catch (error: any) {
            console.error("Passwordless 결과 확인 실패:", error);
            alert(getErrorMessage(error));
            setStep("input");
        } finally {
            setCheckingResult(false);
        }
    };

    const handleReissue = () => {
        setServicePassword("");
        setSessionId("");
        setCheckingResult(false);
        resultStartedRef.current = false;
        handleConfirm();
    };

    useEffect(() => {
        if (step !== "code" || timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [step, timeLeft]);

    useEffect(() => {
        if (step !== "code") {
            return;
        }

        if (mode !== "login") {
            return;
        }

        if (!sessionId) {
            return;
        }

        if (!servicePassword) {
            return;
        }

        if (isExpired) {
            return;
        }

        requestResult();
    }, [step, mode, sessionId, servicePassword, isExpired]);

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
                                        handleConfirm(event);
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
                                type="button"
                                className="passwordless-button"
                                onClick={handleConfirm}
                            >
                                {mode === "setting" ? "Passwordless 설정" : "Passwordless 로그인"}
                            </button>

                            <button
                                type="button"
                                className="passwordless-cancel-button"
                                onClick={() => navigate("/members/login")}
                            >
                                취소
                            </button>

                            <p className="passwordless-signup-text">
                                아직 회원이 아니신가요?{" "}
                                <span
                                    className="passwordless-signup-link"
                                    onClick={() => navigate("/signup/terms")}
                                >
                                    회원가입
                                </span>
                            </p>
                        </>
                    )}

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

                                    <p className="passwordless-loading-text">
                                        앱에서 승인하면 자동으로 로그인됩니다.
                                    </p>
                                </>
                            )}

                            <p className={`auth-timer ${isExpired ? "auth-timer-expired" : ""}`}>
                                {isExpired
                                    ? "⏱ 인증 시간이 만료됐습니다."
                                    : `⏱ 남은 시간 ${timerText}`}
                            </p>

                            {isExpired && (
                                <button
                                    type="button"
                                    className="auth-reissue-button"
                                    onClick={handleReissue}
                                >
                                    인증번호 재발급
                                </button>
                            )}

                            {mode === "login" ? (
                                <button
                                    type="button"
                                    className="passwordless-button"
                                    disabled
                                    style={{ opacity: 0.7, cursor: "wait" }}
                                >
                                    {checkingResult
                                        ? "앱 승인 대기 중..."
                                        : "승인 확인 준비 중..."}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="passwordless-button"
                                    onClick={() => {
                                        alert("Passwordless 등록이 완료됐습니다!");
                                        navigate("/");
                                    }}
                                    disabled={isExpired}
                                    style={
                                        isExpired
                                            ? { opacity: 0.5, cursor: "not-allowed" }
                                            : {}
                                    }
                                >
                                    확인
                                </button>
                            )}

                            <button
                                type="button"
                                className="passwordless-cancel-button"
                                onClick={() => {
                                    setStep("input");
                                    setCheckingResult(false);
                                    resultStartedRef.current = false;
                                }}
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