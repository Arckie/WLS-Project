// 로그인 인증(JWT)을 자동으로 처리해주는 커스텀 axios 설정 파일
// get방식 post방식 등을 계속해서 요청하지 않고 자동으로 하게 만드는 파일

// 즉, API 요청할 때마다 토큰 붙이고
// 인증 실패(401)하면 자동 로그 아웃까지 처리해주는 구조입니다.
// 전체 과정 : 토큰확인 - 토큰이 없거나 올바르지 않은 토큰일 경우 삭제 후 로그인 페이지로 보내서 새로운 토큰 생성 유도

import axios from "axios";
import { API_BASE_URL } from "../config/config";

// withCredentials: true 항목은 세션 방식 설정이므로 jwt를 사용하면 삭제하도록 합니다.
const axiosInstance = axios.create({
    baseURL: API_BASE_URL
});

// 인터셉터(interceptor) : 요청(Request)이나 응답(Response)을 가로 채서 공통 로직을 처리하는 기능입니다.
// 요청(Request) : ~하기 전에 가로채기 (사전)
// 응답(Response) : ~한 후에 가로채기 (사후)
// 요청을 보내기 전에 인터셉터가 자동으로 JWT 붙이기 (사전에 가로채기)
// 토큰을 확인하는 과정
// 스프링 서버로 요청보내기 바로 직전에 가로채서 무조건 실행할 공통 로직
axiosInstance.interceptors.request.use(
    (config) => { // 가로챈 요청의 모든 설정 정보(주소, 헤더, 데이터 등)를 config에 넣어서 가져옴
        // 로컬스토리지에서 이전 로그인 성공때 저장했던 "accessToken"(JWT 토큰 입장권)이 있는지 token 변수에 담아봄
        // 로컬스토리지에 "accessToken"(JWT 토큰 입장권)이 있다 : 로그인한 회원 + 토큰기한이 지나지 않음
        const token = localStorage.getItem("accessToken");
        //  console.log("interceptors.request 토큰 확인 : ", token);

        // 토큰 확인 token이 true이면 로그인한 회원이라는 뜻
        if (token) { // token가 undefined일 수 있으므로...
            // config.headers 공간 자체가 없더라도 에러나지 않게  {}라는 빈공간이라도 만들어두기
            config.headers = config.headers || {};
            // Bearer 단어 대소문자 주의 바람 + token 사이에 한칸 공백 주의
            // headers에 Authorization라는 이름의 key를 만들고 그 key의 value에
            // `Bearer ${token}` 이 값을 넣음
            // Spring Security에서 확인할때 Bearer 뒤에 있는 token을 보고 허가를 해줌
            config.headers.Authorization = `Bearer ${token}`;
        }

        // token이 있으면 config.headers.Authorization에 `Bearer ${token}`을 넣은 config를 반환함
        // token이 없으면 빈 봉투로 스프링에 보내게 됨
        // 스프링에서 SecurityConfig에서 permitAll() 된 부분이면 통과되고 아닌 부분이면 거부됨(401에러 반환됨)
        return config;
    },
    // 스프링 서버에 요청하기도 전에 리액트 자체 내부 오류로 인해 전송 에러가 발생하면 에러를 그 다음단계로 거절하며 넘김
    // ()=> 여기에서 {}를 안적으면 return을 생각해서 바로 return 할 값만 적어도 됨
    // error 발생시 스프링에 보내지 않고 리액트 내부에서 에러처리를 함 (try-catch(error)의 catch부분 실행됨)
    (error) => Promise.reject(error)
);

// 응답 처리 : 401 에러 발생 시 자동 로그 아웃 처리 (사후에 가로채기)
// 401에러 : 인증이 필요하거나 실패했다는 의미
// 올바르지 않아서 401에러가 생긴? 토큰 삭제 후 로그인 페이지로 유도하기
// 스프링 서버로부터 응답을 받고 다른 리액트 코드로 들어가기전에 바로 가로채서 무조건 실행할 공통 로직
axiosInstance.interceptors.response.use(
    // HttpStatus.OK (200번대)같은 응답이 오면 그대로 response로 보내줌
    // () => {} 중괄호를 안써서 return 단어를 생략함
    (response) => response,
    (error) => { // 400, 401, 500 같은 오류 코드로 온다면 가로채서 검사함

        // 현재 에러가 난 이 요청이 "혹시 로그인 하려고 시도했던 요청이었나?"를 판별하는 중
        // 로그인 시도 중 비번을 틀려서 난 401 에러와, 로그인 후 토큰이 만료되어 난 401 에러를 구분 가능
        // url에 "/api/member/login"가 포함되어 있다면 로그인 시도중 비번 틀린 오류
        // 백엔드의 경로(실제 웹페이지의 경로를 입력해야 함)
        const isLoginRequest = error.config?.url?.includes("/api/members/login");

        // 401오류인데 url 주소에 "/api/member/login"가 포함되어있지 않다면 (로그인 시도가 아니니까)
        // 토큰 유효기간이 만료되었거나 토큰이 처음부터 존재하지 않았거나해서 인증이 안된상태
        if (error.response?.status === 401 && !isLoginRequest) {
            // 만료된 토큰 삭제처리 (+ 로그아웃 처리)
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            // window.location.href 사용시 React Router 사용 중이면 
            // 페이지 전체 리로드 발생할 수 있으므로 replace() 메소드 사용 바람
            // 인증이 안된 사용자를 강제로 로그인페이지("/login")로 이동시킴
            // replace()를 사용하면 뒤로가기 기록도 삭제해서 뒤로가기 버튼을 사용하지 못함
            // (프론트 내에서의 주소(path)임 - 화면)
            window.location.replace("/members/login");
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
export { isAxiosError } from "axios";
