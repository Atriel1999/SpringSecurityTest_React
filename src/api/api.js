// src/api/api.js
import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8082'
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 응답 인터셉터 설정 (선택사항) - 토큰 만료 처리 등에 유용
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // 401 에러(인증 실패)이고 재시도 플래그가 없는 경우
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청 (백엔드에 해당 API가 있어야 함)
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://localhost:8082/api/auth/refresh', { refreshToken });
        
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // 새 토큰으로 헤더 설정
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃 처리
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API 함수들 정의
export const fetchUserInfo = () => {
    console.log("fetchUserInfo 호출됨, 토큰:", localStorage.getItem('token'));
    return api.get('/api/user/me');
  };

// 다른 API 호출 함수들...

export default api;