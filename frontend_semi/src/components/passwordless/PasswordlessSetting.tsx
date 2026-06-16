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

    /*
     * 등록 완료 후 같은 화면에서 바로 로그인 플로우로 전환하기 위한 상태.
     * mode는 여전히 setting이어도, 이 값이 true면 로그인 화면처럼 동작한다.
     */
    const [autoLoginAfterRegistration, setAutoLoginAfterRegistration] = useState(false);

    const resultStartedRef = useRef(false);
    const registrationStartedRef = useRef(false);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isExpired = timeLeft <= 0;
    const timerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const navigate = useNavigate();
    const location = useLocation();

    const mode = location.state?.mode ?? "login";

    /*
     * 로그인 플로우:
     * - 원래 로그인 모드
     * - 또는 등록 완료 후 자동 로그인 진행 중
     *
     * 등록 플로우:
     * - setting 모드이면서 아직 자동 로그인으로 넘어가지 않은 상태
     */
    const isLoginFlow = mode === "login" || autoLoginAfterRegistration;
    const isSettingFlow = mode === "setting" && !autoLoginAfterRegistration;

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

    const resetWaitingFlags = () => {
        setCheckingResult(false);
        resultStartedRef.current = false;
        registrationStartedRef.current = false;
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
        resetWaitingFlags();
        setAutoLoginAfterRegistration(false);

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
            resetWaitingFlags();
            setAutoLoginAfterRegistration(false);
        }
    };

    /*
     * 등록 완료 후 자동 로그인 시작.
     * registration-result에서 exist === true가 오면 이 함수가 실행된다.
     */
    const startLoginAfterRegistration = async (targetLoginId: string) => {
        const random = makeId();
        const newSessionId = makeId();

        console.log("등록 완료 후 자동 로그인 시작");
        console.log("userId =", targetLoginId);
        console.log("random =", random);
        console.log("sessionId =", newSessionId);

        setAutoLoginAfterRegistration(true);
        setSessionId(newSessionId);
        setServicePassword("");
        resultStartedRef.current = false;

        /*
         * Passwordless 서버가 등록 완료 직후 내부 상태 반영에 살짝 늦을 수 있어서
         * 짧게 기다렸다가 로그인 요청을 시작한다.
         */
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const response = await axios.post(
            `${API_BASE_URL}/api/passwordless/login-process`,
            {
                userId: targetLoginId,
                random,
                sessionId: newSessionId,
            },
            axiosConfig
        );

        console.log("등록 후 login-process 응답:", response.data);

        const data = response.data?.data;

        if (!data) {
            throw new Error("Passwordless 로그인 응답 데이터가 비어 있습니다.");
        }

        setServicePassword(data.servicePassword ?? "");
        setTimeLeft(180);
        setStep("code");
    };

    const requestResult = async () => {
        if (resultStartedRef.current) {
            console.log("이미 result 대기 요청이 실행 중입니다.");
            return;
        }

        if (isExpired) {
            alert("인증 시간이 만료됐습니다. 다시 시도해주세요.");
            setStep("input");
            setAutoLoginAfterRegistration(false);
            return;
        }

        if (!isLoginFlow) {
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
             * response.data.accessToken이 있으면 로그인 성공.
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
                setAutoLoginAfterRegistration(false);
                return;
            }

            if (auth === "W") {
                alert("아직 승인 대기 중입니다. 다시 시도해주세요.");
                setStep("input");
                setAutoLoginAfterRegistration(false);
                return;
            }

            alert("인증 상태를 확인할 수 없습니다. 다시 시도해주세요.");
            setStep("input");
            setAutoLoginAfterRegistration(false);
        } catch (error: any) {
            console.error("Passwordless 결과 확인 실패:", error);
            alert(getErrorMessage(error));
            setStep("input");
            setAutoLoginAfterRegistration(false);
        } finally {
            setCheckingResult(false);
        }
    };

    const requestRegistrationResult = async () => {
        if (registrationStartedRef.current) {
            console.log("이미 등록 결과 대기 요청이 실행 중입니다.");
            return;
        }

        if (isExpired) {
            alert("등록 시간이 만료됐습니다. 다시 시도해주세요.");
            setStep("input");
            return;
        }

        if (!isSettingFlow) {
            return;
        }

        const trimmedLoginId = loginId.trim();

        if (!trimmedLoginId) {
            console.log("loginId가 비어 있습니다.");
            return;
        }

        try {
            registrationStartedRef.current = true;
            setCheckingResult(true);

            console.log("registration-result 자동 대기 요청 시작");
            console.log("userId =", trimmedLoginId);

            const response = await axios.post(
                `${API_BASE_URL}/api/passwordless/registration-result`,
                {
                    userId: trimmedLoginId,
                },
                axiosConfig
            );

            console.log("registration-result 응답:", response.data);

            const exist = response.data?.data?.exist;

            if (exist === true) {
                alert("Passwordless 등록이 완료됐습니다. 이어서 자동 로그인을 진행합니다.");

                setQrDataUrl("");
                setRegisterKey("");
                setServerUrl("");
                registrationStartedRef.current = false;
                setCheckingResult(false);

                await startLoginAfterRegistration(trimmedLoginId);
                return;
            }

            alert("등록 상태를 확인할 수 없습니다. 다시 시도해주세요.");
            setStep("input");
        } catch (error: any) {
            console.error("Passwordless 등록 결과 확인 실패:", error);
            alert(getErrorMessage(error));
            setStep("input");
        } finally {
            setCheckingResult(false);
            registrationStartedRef.current = false;
        }
    };

    const handleReissue = () => {
        setServicePassword("");
        setSessionId("");
        setQrDataUrl("");
        setRegisterKey("");
        setServerUrl("");
        setAutoLoginAfterRegistration(false);
        resetWaitingFlags();
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

    /*
     * 로그인 승인 대기.
     * 일반 로그인 모드 또는 등록 후 자동 로그인 모드에서 작동한다.
     */
    useEffect(() => {
        if (step !== "code") {
            return;
        }

        if (!isLoginFlow) {
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
    }, [step, isLoginFlow, sessionId, servicePassword, isExpired]);

    /*
     * 등록 완료 대기.
     * setting 모드에서 QR이 발급된 뒤 작동한다.
     */
    useEffect(() => {
        if (step !== "code") {
            return;
        }

        if (!isSettingFlow) {
            return;
        }

        if (!qrDataUrl) {
            return;
        }

        if (isExpired) {
            return;
        }

        requestRegistrationResult();
    }, [step, isSettingFlow, qrDataUrl, isExpired]);

    return (
        <div className="passwordless-page">
            <div className="passwordless-box">
                <h1 className="passwordless-title">풀스택 강의실</h1>

                <p className="passwordless-subtitle">
                    {isSettingFlow
                        ? "Passwordless 앱 등록을 진행합니다."
                        : autoLoginAfterRegistration
                            ? "등록 완료 후 자동 로그인을 진행합니다."
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
                            {isLoginFlow && (
                                <div className="phone-icon-box">📱</div>
                            )}

                            {isSettingFlow ? (
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
                                    {isSettingFlow ? "등록 QR 재발급" : "인증번호 재발급"}
                                </button>
                            )}

                            {isLoginFlow ? (
                                <button
                                    type="button"
                                    className="passwordless-button"
                                    disabled
                                    style={{ opacity: 0.7, cursor: "wait" }}
                                >
                                    {checkingResult
                                        ? "앱 승인 대기 중..."
                                        : autoLoginAfterRegistration
                                            ? "자동 로그인 준비 중..."
                                            : "승인 확인 준비 중..."}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="passwordless-button"
                                    disabled
                                    style={{ opacity: 0.7, cursor: "wait" }}
                                >
                                    {checkingResult
                                        ? "앱 등록 대기 중..."
                                        : "등록 확인 준비 중..."}
                                </button>
                            )}

                            <button
                                type="button"
                                className="passwordless-cancel-button"
                                onClick={() => {
                                    setStep("input");
                                    setAutoLoginAfterRegistration(false);
                                    resetWaitingFlags();
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