import "./SignupTermsSidebar.css";

type SignupSidebarProps = {
  currentStep: 1 | 2 | 3;
};

function SignupSidebar({ currentStep }: SignupSidebarProps) {
  return (
    <aside className="signup-sidebar">
      <h2 className="signup-sidebar-title">회원가입</h2>

      <div
        className={`signup-sidebar-step ${
          currentStep === 1 ? "active" : currentStep > 1 ? "done" : "pending"
        }`}
      >
        <span className="signup-sidebar-step-number">01</span>
        <span className="signup-sidebar-step-check">
          {currentStep > 1 ? "✓" : "□"}
        </span>
        <span>회원 규칙 약관</span>
      </div>

      <div
        className={`signup-sidebar-step ${
          currentStep === 2 ? "active" : currentStep > 2 ? "done" : "pending"
        }`}
      >
        <span className="signup-sidebar-step-number">02</span>
        <span className="signup-sidebar-step-check">
          {currentStep > 2 ? "✓" : "□"}
        </span>
        <span>기본 입력 사항</span>
      </div>

      <div
        className={`signup-sidebar-step ${
          currentStep === 3 ? "active" : "pending"
        }`}
      >
        <span className="signup-sidebar-step-number">03</span>
        <span className="signup-sidebar-step-check">
          {currentStep === 3 ? "✓" : "□"}
        </span>
        <span>가입 완료</span>
      </div>

      <div className="signup-sidebar-guide">
        <p>ⓘ 단계별로 정보를 입력해주세요.</p>
        <p>완료된 단계는 체크 표시됩니다.</p>
      </div>
    </aside>
  );
}

export default SignupSidebar;