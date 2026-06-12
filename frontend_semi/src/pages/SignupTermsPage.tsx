import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SignupSidebar from "../components/layout/SignupTermsSidebar";
import "./SignupTermsPage.css";

function SignupTermsPage() {
  const navigate = useNavigate();

  const [agreeService, setAgreeService] = useState<boolean | null>(null);
  const [agreePrivacy, setAgreePrivacy] = useState<boolean | null>(null);

  const isAllAgreed = agreeService === true && agreePrivacy === true;

  const handleAllAgree = (checked: boolean) => {
    setAgreeService(checked);
    setAgreePrivacy(checked);
  };

  const handleNext = () => {
    if (!isAllAgreed) {
      alert("필수 약관에 모두 동의해주세요.");
      return;
    }

    navigate("/members/signup");
  };

  return (
    <div className="signup-terms-page">
      <SignupSidebar currentStep={1} />

      <main className="signup-terms-main">
        <section className="terms-panel">
          <div className="terms-title-row">
            <div className="terms-title-icon">📋</div>

            <div>
              <h1>회원가입 약관 동의</h1>
              <p>서비스 이용을 위해 약관 및 개인정보 수집 항목에 동의해주세요.</p>
            </div>
          </div>

          <div className="terms-section-card">
            <h3>● 서비스 이용약관</h3>

            <div className="terms-scroll-box">
              <p>
                제1조 목적 본 약관은 풀스택 강의실이 제공하는 모든 서비스의 이용과
                관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
              <p>
                제2조 정의 회원이라 함은 회사가 제공하는 서비스에 접속하여 이 약관에 따라
                이용계약을 체결하고 서비스를 이용하는 자를 말합니다.
              </p>
              <p>
                제3조 약관의 효력 및 변경 이 약관은 서비스를 이용하고자 하는 모든 회원에게
                그 효력이 발생합니다.
              </p>
            </div>

            <div className="terms-agree-row">
              <strong>이용약관 동의</strong>

              <label>
                <input
                  type="radio"
                  name="serviceAgree"
                  checked={agreeService === true}
                  onChange={() => setAgreeService(true)}
                />
                동의
              </label>

              <label>
                <input
                  type="radio"
                  name="serviceAgree"
                  checked={agreeService === false}
                  onChange={() => setAgreeService(false)}
                />
                비동의
              </label>
            </div>
          </div>

          <div className="terms-section-card">
            <h3>● 개인정보 수집 및 이용 동의</h3>

            <div className="terms-scroll-box">
              <p>
                풀스택 강의실은 회원가입 및 서비스 제공을 위해 아이디, 비밀번호, 이름,
                이메일 주소, 휴대전화 번호, 생년월일 등의 개인정보를 수집 및 이용합니다.
              </p>
              <p>
                수집된 개인정보는 회원 관리, 서비스 제공, 고객 상담, 학습 분석 및 서비스
                개선을 위한 목적으로 사용됩니다.
              </p>
              <p>
                회원은 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나, 동의 거부 시
                회원가입 및 서비스 이용이 제한될 수 있습니다.
              </p>
            </div>

            <div className="terms-agree-row">
              <strong>개인정보 수집 동의</strong>

              <label>
                <input
                  type="radio"
                  name="privacyAgree"
                  checked={agreePrivacy === true}
                  onChange={() => setAgreePrivacy(true)}
                />
                동의
              </label>

              <label>
                <input
                  type="radio"
                  name="privacyAgree"
                  checked={agreePrivacy === false}
                  onChange={() => setAgreePrivacy(false)}
                />
                비동의
              </label>
            </div>
          </div>

          <div className="terms-bottom-row">
            <label className="terms-all-check">
              <input
                type="checkbox"
                checked={isAllAgreed}
                onChange={(event) => handleAllAgree(event.target.checked)}
              />
              전체 약관에 동의합니다
            </label>

            <div className="terms-button-group">
              <button
                className="terms-prev-button"
                onClick={() => navigate("/members/login")}
              >
                이전
              </button>

              <button
                className={
                  isAllAgreed
                    ? "terms-next-button"
                    : "terms-next-button disabled"
                }
                onClick={handleNext}
              >
                다음 단계
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SignupTermsPage;