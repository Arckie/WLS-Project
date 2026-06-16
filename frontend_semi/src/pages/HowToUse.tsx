import { useState } from "react";
// react-icons: 아이콘을 쉽게 불러오기 위한 라이브러리입니다.
import {
  FiSettings,
  FiCode,
  FiCheckCircle,
  FiEdit,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import "./HowToUse.css";

// 사용할 이미지 파일들을 불러옵니다.
import image01 from "../assets/01_1.jpg";
import image02 from "../assets/02_1.jpg";
import image03 from "../assets/3.jpg";
import image04 from "../assets/4.jpg";

/**
 * 학습 가이드 단계별 데이터(배열) 탭과 관련 내용으로 들어갑니다.
 * 나중에 새로운 단계를 추가하고 싶다면 이 배열 안에 객체만 추가하면 됩니다.
 */
const models = [
  {
    id: 1,
    icon: <FiSettings />,
    title: "학습 시작",
    desc: "온라인 학습 공간에 접속하여 학습할 강의를 선택하고 기본 환경을 준비합니다.",
    steps: ["학습 플랫폼 접속", "회원가입 및 로그인", "강의실 입장"],
    img: [image01] // 1.jpg: 학습 시작 화면
  },
  {
    id: 2,
    icon: <FiCode />,
    title: "코드 구조 확인",
    desc: "강의에서 제공하는 Spring Boot 및 JPA 코드 예시를 확인하고 분석합니다.",
    steps: ["강의 목록 확인", "코드 예시 파악", "복사 기능 활용"],
    img: [image02] // 2.jpg: 강의 목록 및 코드 예시 화면
  },
  {
    id: 3,
    icon: <FiEdit />,
    title: "코드 수정 및 작성",
    desc: "기존 코드를 수정하거나 새로운 기능을 위한 코드를 작성합니다.",
    steps: ["코드 수정 버튼 클릭", "새 글 작성/수정 모드 진입", "비즈니스 로직 구현"],
    img: [image03] // 3.jpg: 수정 및 새 글 작성 기능
  },
  {
    id: 4,
    icon: <FiCheckCircle />,
    title: "개발 도구 활용",
    desc: "IntelliJ IDEA를 사용하여 효율적인 개발 환경을 구축하고 어노테이션을 적용합니다.",
    steps: ["IntelliJ IDEA 설치 및 설정", "@Service, @RequiredArgsConstructor 적용", "코드 구현"],
    img: [image04] // 4.jpg: IDE 추천 및 서비스 코드 어노테이션
  }
];

function HowToUse() {
//active: 현재 선택된 '단계(객체)'를 저장
  const [active, setActive] = useState(models[0]);

// 이전 버튼 동작
  const handlePrev = () => {
    const currentIndex = models.findIndex((item) => item.id === active.id);

    if (currentIndex > 0) {
      setActive(models[currentIndex - 1]);
    }
  };

// 다음 버튼 동작
  const handleNext = () => {
    const currentIndex = models.findIndex((item) => item.id === active.id);

    if (currentIndex < models.length - 1) {
      setActive(models[currentIndex + 1]);
    }
  };

  return (
    <div className="site-intro-page">
      <section className="site-intro-frame">
        <div className="howto2-hero">

        {/* 타이틀 영역 */}
          <div className="howto2-heading">
            <h1>
              배움이 쉬워지는 <span>온라인 학습 가이드</span>
            </h1>
            <p>설치부터 구현까지, 풀스택 개발의 전체 흐름을 한눈에 파악하세요.</p>
          </div>

        {/* 상단 탭 메뉴 영역
            models 배열을 순회(map)하며 버튼을 동적으로 생성,
            현재 선택된 버튼에만 "active"
        */}
          <div className="model-tabs">
            {models.map((item) => (
              <button
                key={item.id}
                type="button"
                className={active.id === item.id ? "model-tab active" : "model-tab"}
                onClick={() => setActive(item)} // 버튼 클릭 시 해당 단계로 상태 변경
              >
                <span className="model-tab-icon">{item.icon}</span>
                <span>{item.title}</span>
              </button>
            ))}
          </div>

        {/* 하단 콘텐츠 영역 (설명 + 이미지) */}
         <div className="model-content">

           {/* 왼쪽 버튼 */}
           <button
             type="button"
             className="arrow-btn left"
             onClick={handlePrev}>
             <FiChevronLeft />
           </button>

            {/* 설명 영역 (현재 선택된 상태인 active의 내용을 보여줌) */}
           <section className="left-content">
             <h1>{active.title}</h1>
             <p className="main-desc">{active.desc}</p>

             <ul className="learning-steps">
                {active.steps && active.steps.map((step, index) => (
                    <li key={index}>{step}</li>))}
             </ul>
           </section>

            {/* 이미지 영역 (상태에 따라 이미지를 다르게 보여줌) */}
           <section className="right-content">
           {/* 이미지가 배열이면 map으로 각각 출력하고,
            한 장이면 단일 태그로 출력하는 조건부 렌더링입니다.
            */}
             <div
               className={
                 Array.isArray(active.img) && active.img.length > 1
                   ? "image-grid two-images"
                   : "image-grid one-image"
               }
             >

               {Array.isArray(active.img) ? (
                 active.img.map((src, index) => (
                   <div key={index} className="image-frame">
                     <img src={src} alt={`${active.title}-${index}`} />
                   </div>
                 ))
               ) : active.img ? (
                 <div className="image-frame full">
                   <img src={active.img} alt={active.title} />
                 </div>
               ) : null}
             </div>
           </section>


            {/* 오른쪽 버튼 */}
           <button
             type="button"
             className="arrow-btn right"
             onClick={handleNext}>
             <FiChevronRight />
           </button>

         </div>
        </div>
      </section>
    </div>
  );
}

export default HowToUse;