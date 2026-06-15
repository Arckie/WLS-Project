import axios from "axios";

const customAxios = axios.create({
    // 같은 EC2에서 프론트와 백엔드를 같이 쓰고,
    // Nginx 또는 같은 호스트 기준으로 /api 요청을 보낼 거면 baseURL은 비워둔다.
    // 즉 customAxios.post("/api/...", ...) 형태로 호출한다.
    baseURL: "",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: false,
});

customAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        const url = config.url ?? "";

        // 로그인 없이 접근해야 하는 공개 API들
        const publicUrls = [
            "/api/members/login",
            "/api/members/signup",
            "/api/members/checkId",
            "/api/members/passwordless-login",
            "/api/passwordless/",
            "/files/",
            "/images/",
        ];

        const isPublicUrl = publicUrls.some((publicUrl) =>
            url.startsWith(publicUrl)
        );

        // 공개 API에는 Authorization을 붙이지 않는다.
        // 깨진 토큰/만료 토큰이 붙어서 JWT 필터에 걸리는 걸 방지.
        if (token && !isPublicUrl) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

customAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Axios 응답 에러:", error);
        return Promise.reject(error);
    }
);

export default customAxios;