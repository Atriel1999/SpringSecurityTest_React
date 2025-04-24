import React, { useEffect, useState } from 'react';
import { fetchUserInfo } from './api/api';

function App() {
  const [loginStatus, setLoginStatus] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("App 컴포넌트 렌더링, 상태:", { loginStatus, loading });
  
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8082/oauth2/authorization/google';
  };
  
  const checkLoginStatus = async () => {
    try {
      const response = await fetchUserInfo();
      console.log("사용자 정보 응답:", response.data); // axios는 response.data에 JSON을 제공합니다
      
      let processedUserInfo;
      if (typeof response.data === 'string' && response.data.includes('Username=')) {
        // Spring Security User 객체를 문자열로 받은 경우
        const username = response.data.match(/Username=(.*?),/)?.[1] || '사용자';
        const authorities = response.data.match(/Granted Authorities=\[(.*?)\]/)?.[1] || '';
        
        processedUserInfo = {
          name: username,
          email: '정보 없음',
          picture: null,
          authorities: authorities.split(', ')
        };
      } else {
        // 일반 사용자 객체를 받은 경우
        processedUserInfo = response.data;
      }
      
      setUserInfo(processedUserInfo);
      setLoginStatus('성공');
    } catch (error) {
      console.log("로그인 상태가 아님:", error);
      setLoginStatus(null);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setLoginStatus(null);
    setUserInfo(null);
  };
  
  useEffect(() => {
  // URL 파라미터에서 토큰 추출
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const refreshToken = params.get('refreshToken');
  
  console.log("URL 파라미터:", window.location.search);
  console.log("추출된 토큰:", token);
  console.log("추출된 리프레시 토큰:", refreshToken);
  
  if (token) {
    // 토큰을 localStorage에 저장
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    console.log("로컬 스토리지에 토큰 저장 완료");
    
    // URL에서 토큰 제거 (선택사항)
    window.history.replaceState({}, document.title, '/');
  }
  
  // 로그인 상태 확인
  checkLoginStatus();
  }, []);
  
  if (loading) {
    return <div>로딩 중...</div>;
  }
  
  return (
    <div className="app-container" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Google 소셜 로그인 테스트</h1>
      
      <div style={{ fontSize: '12px', color: 'gray', marginBottom: '10px' }}>
        디버깅: loginStatus={String(loginStatus)}, loading={String(loading)}, 
        userInfo={userInfo ? '존재함' : '없음'}
      </div>

      {!loginStatus && (
        <div>
          <p>로그인이 필요합니다</p>
          <button 
            onClick={handleGoogleLogin}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#4285F4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Google로 로그인
          </button>
        </div>
      )}
      
      {loginStatus === '성공' && userInfo && (
        <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h2 style={{ color: '#4285F4' }}>로그인 성공!</h2>
          <div>
            {userInfo.picture ? (
              <img
                src={userInfo.picture}
                alt="Profile"
                style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '10px' }}
              />
            ) : (
              // 사진이 없는 경우 이니셜 표시
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#4285F4', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '10px auto'
              }}>
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <h3>{userInfo.name}님 안녕하세요!</h3>
            <p>이메일: {userInfo.email || '정보 없음'}</p>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;