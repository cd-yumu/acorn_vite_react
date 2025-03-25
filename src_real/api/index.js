// src/api/index.js

import axios from "axios";

// baseURL 값으로 /api 를 기본으로 가지고 있는 axios 객체를 만들어서
const api = axios.create({  // 요청 intercepter 추가?
    baseURL:"/api"
});
// Vite 에서는 요청 시 무조건 앞에 /api 를 붙이고 보내야한다. "/api/ping" 과 같이.. 
// 그런데 개발할 때는 붙였다가 이후 build 시에는 필요가 없으니
// 기본값으로 /api 를 붙이도록 설정해준다.
// 개발 시 -> baseURL:"/api"
// 배포 시 -> baseURL:""

// 요청 인터셉터 (예: 토큰 자동 추가)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    // 만약 토큰이 존재한다면면
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
});


// 리턴해준다
export default api;