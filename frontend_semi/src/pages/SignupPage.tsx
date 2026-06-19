import {useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import customAxios from "../api/axiosInstance";

import "./SignupPage.css"
import SignupSidebar from "../components/layout/SignupTermsSidebar";
import { LEARNING_PROFILE_OPTIONS } from "../constants/memberProfile";
import { MEMBER_PASSWORD_REGEX } from "../constants/validation";
import {
    buildDayOptions,
    buildMonthOptions,
    buildYearOptions,
    removeNonNameCharacters,
} from "../utils/memberFormUtils";

function SignupPage(){
    const navigate = useNavigate();
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState(""); // 패스워드 확인창
    const [isIdDuplicate, setisIdDuplicate] = useState(false);  // ID 중복을 체크하는 변수를 지정
    //=====================================================================
    // 이름을 지정하는 변수
    const [name, setName] = useState("");
    
    //=====================================================================
    // 생년월일을 연, 월, 일로 따로 받아 fullBirthDate에 맞는 양식으로 DB에 제공
    const [yyyy, setYyyy] = useState("");
    const [mm, setMm] = useState("");
    const [dd, setDd] = useState("");

    const years = buildYearOptions();
    const months = buildMonthOptions();
    const days = buildDayOptions(yyyy, mm);

    const fullBirthDate = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    //======================================================================
    // 핸드폰 번호를 앞자리 중간자리 마지막 자리로 받아 한번에 합치는 과정
    const [phoneNumber1, setPhoneNumber1] = useState("010");
    const [phoneNumber2, setPhoneNumber2] = useState("");
    const [phoneNumber3, setPhoneNumber3] = useState("");

    const phone = `${phoneNumber1}-${phoneNumber2}-${phoneNumber3}`;
    // EMAIL을 아이디와 도메인 아이디@도메인에 맞는 양식으로 DB에 제공
    const [emailId, setEmailId] = useState("");
    const [emailDomain, setEmailDomain] = useState("naver.com");
    const [customDomain, setCustomDomain] = useState("");

    let fullEmail = "";
    if(customDomain == ""){
        fullEmail = `${emailId}@${emailDomain}`;
    } else{
        fullEmail = `${emailId}@${customDomain}`;
    }
    //======================================================================
    // 패스워드 제약조건을 설정함. 8자리 이상, 255자리 이하, ~!@#$%^& 특문 포함되어야함.
    //======================================================================
    // 패스워드를 처리하기 위해 변수를 지정
    const isBothPasswordEntered = password !== "" && passwordConfirm !== ""; // 두개의 비밀번호가 입력되었는지 확인하는 변수
    const isPasswordMatched = password === passwordConfirm; // 패스워드와 패스워드 확인창에 같은 값이 입력되었는지를 확인하는 변수
    const isPasswordValid = MEMBER_PASSWORD_REGEX.test(password); // 패스워드가 제약조건에 만족하는지 확인하는 boolean값을 저장하는 변수

    // useRef, 어느 곳에 포커스를 해두고 난 다음 확인을 눌렀을때 그 쪽으로 포커스를 이동하는데 쓰임.
    const loginIdRef = useRef<HTMLInputElement>(null);
    const yyyyRef = useRef<HTMLSelectElement>(null);
    //======================================================================
    const [profileIds, setProfileIds] = useState<number[]>([]);

    const handleProfileChange = (profileId: number) => {
        if(profileIds.includes(profileId)){
            setProfileIds(profileIds.filter((id)=> id !== profileId));
        } else {
            setProfileIds([...profileIds, profileId]);
        }
    };
    const sortedProfileIds = [...profileIds].sort((a, b) => a - b);
    //======================================================================
    // 패스워드 제약조건 관련한 메시지를 출력하기 위한 빈 변수 설정
    let passwordMessage = "";
    let passwordMessageColor = "";
    let isPasswordError = false;
    let passwordInputColor = "";
    //======================================================================
    // 패스워드 처리에 대한 조건문 작성
    if(isBothPasswordEntered && !isPasswordMatched){ // 두 패스워드가 입력되었고 패스워드가 일치하지 않는 경우를 처리
        passwordMessage = "비밀번호가 일치하지 않습니다!";
        passwordMessageColor = "red";
        isPasswordError = true;
        passwordInputColor = passwordMessageColor;
    } else if(isBothPasswordEntered && isPasswordMatched && !isPasswordValid){ // 두 패스워드가 입력되었고 패스워드가 일치하지만 제약조건에 만족하지 않는 경우
        passwordMessage = "비밀번호는 8자리 이상, 대문자 1개 이상, 특수문자 ~!@#$%^& 중 하나 이상을 포함해야합니다."
        passwordMessageColor = "red";
        isPasswordError = true;
        passwordInputColor = passwordMessageColor;
    } else if(isBothPasswordEntered && isPasswordMatched && isPasswordValid){ // 두 패스워드가 입력되었고 패스워드가 일치하며 제약조건을 만족하는 경우
        passwordMessage = "비밀번호가 일치합니다."
        passwordMessageColor = "green"; // 일치할때는 초록색으로 표현하고, 일치하지 않을때는 그린으로 표현
        isPasswordError = false;
        passwordInputColor = ""; // 패스워드 입력창의 색상을 지정하는 란이며 어떤 조건을 만족하지 않을때에 빨간색 테두리가 쳐지게 설정하기 위한 색상을 지정하는 변수
    }
    //======================================================================
    // ID가 중복되는지 확인하는 함수.
    const handleIdCheck = async () => {
         const response = await customAxios.get("/api/members/checkId", {
            // checkId는 ID 중복을 확인하는 API입니다.
            params: {
            loginId: loginId,
            },
         });
         if(loginId === ""){ // 사용자가 아이디를 입력하지 않고 버튼을 클릭하였을떄
            alert("아이디를 입력해주세요.");
            return ;
         }
         if(response.data){ // 존재하는 아이디를 입력하였을때
            alert("이미 존재하는 아이디입니다.");
            setisIdDuplicate(true); // IdDuplicate 함수에 boolean 값을 저장하기 위한 변수
         } else {
            alert("사용할 수 있는 아이디입니다.");
            setisIdDuplicate(false);
         }
         
 //        console.log("아이디 중복 체크 완료 응답: ", response.data);
    }
    //===================================================================================
    // 이름 제약조건을 주는 함수
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        const filteredValue = removeNonNameCharacters(inputValue);
        setName(filteredValue);
    };
    //===================================================================================
    const handlePasswordFocus = () =>{
        if(loginId.trim() === ""){
            alert("아이디를 먼저 입력해주세요!");
            loginIdRef.current?.focus(); 
            // 이렇게 하면 함수가 반복 실행되지 않고 포커스를 이동해줌. 해주지 않으면 포커스가 이동되지 않아 무한으로 실행됨
        }
    };
    //===================================================================================
    // 연도를 선택하기 전에 월이나 일을 먼저 선택하였을때, 포커스를 연도로 주기
    const handleYearFocus = () => {
        if(yyyy.trim() === ""){
            alert("연도를 먼저 선택해주세요.");
            yyyyRef.current?.focus();
        }
    }
    //===================================================================================
    // 정보가 제대로 프론트 콘솔에서 뜨는지 체크
 //   const handleSignupCheck = () => {

//        console.log("로그인 ID : " + loginId);
//       console.log("비밀번호 : " + password);
//        console.log("이름 : " + name);
//        console.log("이메일 : " + fullEmail);
//       console.log("폰번호 : " + phone);
//       console.log("생년월일 : " + fullBirthDate);
//       console.log("관심학습 : " + sortedProfileIds);
        
//    };
    //===================================================================================
    const handleSignUp = async () => {
        try{
        // 비밀번호 일치여부 확인
        if(isIdDuplicate){
            alert("중복된 아이디입니다.");
            return;
        }
        if(loginId.trim() == ""){
            alert("아이디를 입력해주세요.");
            return;
        }
        if(!isPasswordMatched){
            alert("패스워드가 일치하지 않습니다!");
            return;
        }
        if(!isPasswordValid){
            alert("패스워드가 유효하지 않습니다!");
            return;
        }
        if(emailId.trim() == ""){
            alert("이메일 아이디를 입력해주세요.");
            return;
        }
        if(!isIdDuplicate && loginId !== "" && isPasswordMatched && isPasswordValid && emailId !== ""){
           await customAxios.post("/api/members/signup",
        {
            loginId: loginId,
            password: password,
            name: name,
            email: fullEmail,
            phone: phone,
            birthDate: fullBirthDate,
            profileIds: sortedProfileIds,
        },
        {
        headers:{
            "Content-Type": "application/json",
                },
        });
      //    console.log("가입 성공 응답 ", response.data);
        }   
        // 로그인 성 시 토큰과 회원번호, 이름을 사용자 저장소에 저장함.
            navigate("/signup/complete", {
                 state: {
                 signupComplete: true,
                 name: name,
                     },
                });
       } catch(error){
        console.error("회원가입 실패:", error);
        alert("회원가입에 실패했습니다.");
        return;
       }
    }
        // 아이디 중복 여부 체크 API
 return (
  <div className="signup-page">
    <SignupSidebar currentStep={2} />

    <main className="signup-main">
      <section className="signup-panel">
        <div className="signup-title-row">
          <div className="signup-title-icon">📝</div>

          <div>
            <h1>기본 입력 사항</h1>
            <p>회원가입에 필요한 정보를 입력해주세요.</p>
          </div>
        </div>

        <div className="signup-form-card">
          <div className="signup-form-row">
            <label className="signup-label">아이디</label>

            <div className="signup-inline-group">
              <input
                ref={loginIdRef}
                className="signup-input"
                type="text"
                placeholder="아이디를 입력하세요."
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
              />

              <button className="signup-small-button" onClick={handleIdCheck}>
                중복확인
              </button>
            </div>
          </div>

 <div className="signup-form-row password-row">
  <label className="signup-label">비밀번호</label>

  <div className="password-area">
    <div className="password-box">
      <input
        className="signup-input password-input"
        type="password"
        placeholder="비밀번호를 입력하세요."
        value={password}
        onFocus={handlePasswordFocus}
        onChange={(event) => setPassword(event.target.value)}
        style={{
          border: isPasswordError
            ? `2px solid ${passwordInputColor}`
            : undefined,
        }}
      />

      <p className={isPasswordError ? "signup-message error" : "signup-helper-text"}>
        8자리 이상, 대문자 1개 이상, 특수문자 포함
      </p>
    </div>

    <label className="password-confirm-label">비밀번호 확인</label>

    <div className="password-box">
      <input
        className="signup-input password-input"
        type="password"
        placeholder="비밀번호를 다시 입력하세요."
        value={passwordConfirm}
        onFocus={handlePasswordFocus}
        onChange={(event) => setPasswordConfirm(event.target.value)}
        style={{
          border: isPasswordError
            ? `2px solid ${passwordInputColor}`
            : undefined,
        }}
      />

      {passwordMessage !== "" && (
        <p
          className={
            passwordMessageColor === "red"
              ? "signup-message error"
              : "signup-message success"
          }
        >
          {passwordMessage}
        </p>
      )}
    </div>
  </div>
</div>

          <div className="signup-form-row">
            <label className="signup-label">이름</label>

            <input
              className="signup-input name-input"
              type="text"
              placeholder="이름을 입력하세요."
              value={name}
              onChange={handleNameChange}
            />
          </div>

          <div className="signup-form-row">
            <label className="signup-label">이메일</label>

            <div className="signup-email-group">
              <input
                className="signup-input email-id"
                type="text"
                placeholder="이메일 아이디"
                value={emailId}
                onChange={(event) => setEmailId(event.target.value)}
              />

              <span className="signup-at">@</span>

              <select
                className="signup-select email-domain"
                value={emailDomain}
                onChange={(event) => setEmailDomain(event.target.value)}
              >
                <option value="naver.com">naver.com</option>
                <option value="gmail.com">gmail.com</option>
                <option value="daum.net">daum.net</option>
                <option value="kakao.com">kakao.com</option>
                <option value="custom">직접 입력</option>
              </select>

              {emailDomain === "custom" && (
                <input
                  className="signup-input custom-domain"
                  type="text"
                  placeholder="도메인 입력"
                  value={customDomain}
                  onChange={(event) => setCustomDomain(event.target.value)}
                />
              )}
            </div>
          </div>

          <div className="signup-form-row">
            <label className="signup-label">휴대전화</label>

            <div className="signup-phone-group">
              <select
                className="signup-select phone-first"
                value={phoneNumber1}
                onChange={(event) => setPhoneNumber1(event.target.value)}
              >
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
              </select>

              <span>-</span>

              <input
                className="signup-input phone-part"
                type="text"
                placeholder="1234"
                value={phoneNumber2}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 4);
                  setPhoneNumber2(value);
                }}
              />

              <span>-</span>

              <input
                className="signup-input phone-part"
                type="text"
                placeholder="5678"
                value={phoneNumber3}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 4);
                  setPhoneNumber3(value);
                }}
              />
            </div>
          </div>

          <div className="signup-form-row">
            <label className="signup-label">생년월일</label>

            <div className="signup-birth-group">
              <select
                ref={yyyyRef}
                className="signup-select birth-year"
                value={yyyy}
                onChange={(event) => {
                  setYyyy(event.target.value);
                  setMm("");
                  setDd("");
                }}
              >
                <option value="">연도</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <span>년</span>

              <select
                className="signup-select birth-month"
                value={mm}
                onFocus={handleYearFocus}
                onChange={(event) => {
                  setMm(event.target.value);
                  setDd("");
                }}
              >
                <option value="">월</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <span>월</span>

              <select
                className="signup-select birth-day"
                value={dd}
                onFocus={handleYearFocus}
                onChange={(event) => setDd(event.target.value)}
              >
                <option value="">일</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <span>일</span>
            </div>
          </div>

          <div className="signup-form-row">
            <label className="signup-label">관심 학습 분야</label>

            <div className="signup-profile-group">
              {LEARNING_PROFILE_OPTIONS.map((profile) => (
                <label key={profile.id}>
                  <input
                    type="checkbox"
                    checked={profileIds.includes(profile.id)}
                    onChange={() => handleProfileChange(profile.id)}
                  />
                  {profile.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="signup-button-row">
          <button
            className="signup-prev-button"
            onClick={() => navigate("/signup/terms")}
          >
            이전
          </button>

   {/*       <button className="signup-check-button" onClick={handleSignupCheck}>
            입력값 확인
          </button> */}

          <button className="signup-submit-button" onClick={handleSignUp}>
            가입하기
          </button>
        </div>
      </section>
    </main>
  </div>
);
}

export default SignupPage;
