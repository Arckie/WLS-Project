import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SignupSidebar from "../components/layout/SignupTermsSidebar";
import "./SignupCompletePage.css";

type SignupCompleteState = {
  signupComplete?: boolean;
  name?: string;
};

function SignupCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as SignupCompleteState | null;

  useEffect(() => {
    if (!state?.signupComplete) {
      alert("정상적인 회원가입 절차를 통해 접근해주세요.");
      navigate("/signup/terms", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.signupComplete) {
    return null;
  }

  return (
    <div className="signup-complete-page">
      <SignupSidebar currentStep={3} />

      <main className="signup-complete-main">
        <section className="signup-complete-panel">
          <div className="signup-complete-card">
            <div className="signup-complete-icon">🎉</div>

            <h1>회원가입이 완료되었습니다!</h1>

            <p className="signup-complete-message">
              {state.name ? `${state.name}님, ` : ""}
              풀스택 강의실 회원가입을 환영합니다.
            </p>

            <p className="signup-complete-sub-message">
              이제 로그인 후 강의실 서비스를 이용할 수 있습니다.
            </p>

            <div className="signup-complete-button-row">
              <button
                className="signup-complete-login-button"
                onClick={() => navigate("/members/login")}
              >
                로그인하러 가기
              </button>

              <button
                className="signup-complete-home-button"
                onClick={() => navigate("/")}
              >
                홈으로 이동
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SignupCompletePage;