import React, { useState } from 'react';
import { authAPI } from '../../api/auth';
import '../../styles/auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 處理傳統登入邏輯
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.status) {
        // 處理登入成功
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('登入失敗:', error);
    }
  };

  const handleGoogleLogin = () => {
    const callbackUrl = `${window.location.origin}/dashboard`;
    authAPI.googleLogin(callbackUrl);
  };

  return (
    <div className="login-container">
      {/* 傳統登入表單 */}
      <div className="traditional-login">
        <h2>登入</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="密碼"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button type="submit">登入</button>
        </form>
      </div>

      {/* 分隔線 */}
      <div className="divider">
        <span>或</span>
      </div>

      {/* 第三方登入按鈕 */}
      <div className="social-login">
        <button 
          className="google-btn"
          onClick={handleGoogleLogin}
        >
          <img src="/google-icon.svg" alt="Google" />
          使用 Google 帳號登入
        </button>
        
        {/* 未來可以輕鬆添加其他第三方登入按鈕 */}
        {/* <button className="facebook-btn">
          <img src="/facebook-icon.svg" alt="Facebook" />
          使用 Facebook 帳號登入
        </button> */}
      </div>
    </div>
  );
};

export default LoginPage; 