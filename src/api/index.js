// src/api/index.js
import axios from "axios";
// Vite React 에서는 서버에 요청 시 axios 를 대신하는 api 를 사용한다.
// 왜?

// axios 객체를 만들어서 api 로 사용
const api = axios.create({  
    baseURL:"/api"          // 기본 요청 주소는 /api (모든 요청의 주소의 맨 앞에 /api 가 자동으로 달린다 )
});

// 요청 인터셉터 (예: 토큰 자동 추가)
api.interceptors.request.use((config) => {
    // 웹 페이지의 localStorage 에서 token 확인
    const token = localStorage.getItem('token');  
    // 만약 토큰이 존재한다면
    if (token) {
      // 요청의 헤더에 Authorization 으로 토큰 달아주기
      config.headers.Authorization = token;
    }
    return config;
});

// 리턴해준다
export default api;