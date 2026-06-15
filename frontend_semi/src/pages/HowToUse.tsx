import { useState } from "react";
// react-icons: 아이콘을 쉽게 불러오기 위한 라이브러리입니다.
import {
  FiSettings,
  FiCode,
  FiMonitor,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

import "./HowToUse.css";

// 사용할 이미지 파일들을 불러옵니다.
import image01 from "../assets/홈페이지_김리운_01.png";
import image02 from "../assets/홈페이지_김리운_02.png";

/**
 * 학습 가이드 단계별 데이터(배열) 탭과 관련 내용으로 들어갑니다.
 * 나중에 새로운 단계를 추가하고 싶다면 이 배열 안에 객체만 추가하면 됩니다.
 */
const models = [
  {
    id: 1,
    icon: <FiSettings />,
    title: "설치 및 환경설정",
    desc: "개발에 필요한 프로그램을 설치하고 기본 환경을 준비합니다.",
    steps: ["Node.js 설치", "VS Code 설치", "필수 확장 프로그램 확인"],
    img: [image01, image02] // 이미지가 여러 장일 경우 배열 사용
  },
  {
    id: 2,
    icon: <FiCode />,
    title: "코드 예시 확인",
    desc: "백엔드와 프론트엔드 코드가 어떻게 작성되는지 확인합니다.",
    steps: ["백엔드 API 구조 분석", "프론트엔드 컴포넌트 구조 확인"]
  },
  {
    id: 3,
    icon: <FiMonitor />,
    title: "구현 화면 확인",
    desc: "작성한 코드가 실제 화면에서 어떻게 보이는지 확인합니다.",
    steps: ["백엔드 API 구조 분석", "프론트엔드 컴포넌트 구조 확인"],
    img: image02
  },
  {
    id: 4,
    icon: <FiCheckCircle />,
    title: "프로젝트 적용",
    desc: "배운 내용을 프로젝트에 적용하고 동작을 확인합니다.",
    steps: ["백엔드 API 구조 분석", "프론트엔드 컴포넌트 구조 확인"]
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