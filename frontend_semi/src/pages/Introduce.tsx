import "./Introduce.css";

function Introduce(){

   return (
    <div className="site-intro-page">
      <section className="site-intro-frame">
        <div className="site-intro-hero">
          <div className="site-intro-hero-text">
            <p className="site-intro-badge">FULLSTACK CLASSROOM</p>

            <h1>
              Spring Boot와 React를 함께 배우는
              <br />
              풀스택 개발 학습 공간
            </h1>

            <p className="site-intro-description">
              풀스택 강의실은 백엔드와 프론트엔드를 따로 배우는 데서 끝나지 않고,
              실제 웹 서비스가 어떻게 연결되고 동작하는지 이해할 수 있도록 돕는
              온라인 학습 플랫폼입니다.
            </p>
          </div>

          <div className="site-intro-stack-box">
            <div className="site-stack-card spring-card">
              <span>🌱</span>
              <strong>Spring Boot</strong>
              <p>API · 서버 로직 · DB 연동</p>
            </div>

            <div className="site-stack-card react-card">
              <span>⚛️</span>
              <strong>React</strong>
              <p>컴포넌트 · 상태 관리 · 화면 구현</p>
            </div>
          </div>
        </div>

        <div className="site-intro-main-grid">
          <section className="site-feature-area">
            <div className="site-section-title">
              <h2>이 사이트에서 배우는 것</h2>
              <p>실제 프로젝트 흐름을 기준으로 학습합니다.</p>
            </div>

            <div className="site-feature-grid">
              <div className="site-feature-card">
                <div className="site-feature-icon">🧩</div>
                <h3>백엔드 구조</h3>
                <p>Controller, Service, Repository 흐름을 배웁니다.</p>
              </div>

              <div className="site-feature-card">
                <div className="site-feature-icon">🖥️</div>
                <h3>프론트 구현</h3>
                <p>React 컴포넌트와 화면 전환을 익힙니다.</p>
              </div>

              <div className="site-feature-card">
                <div className="site-feature-icon">🔗</div>
                <h3>API 연동</h3>
                <p>Axios로 서버 데이터를 화면에 연결합니다.</p>
              </div>

              <div className="site-feature-card">
                <div className="site-feature-icon">🗄️</div>
                <h3>DB 활용</h3>
                <p>회원, 강의, 게시글 데이터를 저장하고 조회합니다.</p>
              </div>
            </div>
          </section>

          <section className="site-flow-area">
            <div className="site-section-title">
              <h2>학습 흐름</h2>
              <p>개념부터 구현까지 순서대로 따라갑니다.</p>
            </div>

            <div className="site-flow-list">
              <div className="site-flow-item">
                <span>01</span>
                <p>개념 이해</p>
              </div>

              <div className="site-flow-item">
                <span>02</span>
                <p>코드 예시 확인</p>
              </div>

              <div className="site-flow-item">
                <span>03</span>
                <p>구현 화면 확인</p>
              </div>

              <div className="site-flow-item">
                <span>04</span>
                <p>프로젝트 적용</p>
              </div>
            </div>

            <div className="site-intro-message">
              <h3>개발을 처음부터 끝까지 연결해서 배우는 공간</h3>
              <p>
                백엔드, 프론트엔드, 데이터베이스, API 연결까지 하나의 웹 서비스가
                완성되는 흐름을 이해하는 것을 목표로 합니다.
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );

}
export default Introduce;