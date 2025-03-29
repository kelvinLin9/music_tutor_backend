import React, { useState, useEffect } from 'react';
import { authAPI } from '../../api/auth';
import '../../styles/auth.css';

const UserSettings = () => {
  const [user, setUser] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // 獲取用戶資訊
      const userResponse = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const userData = await userResponse.json();
      setUser(userData);

      // 獲取已連接的帳號
      const accounts = await authAPI.getConnectedAccounts();
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async (provider) => {
    try {
      const callbackUrl = `${window.location.origin}/settings`;
      if (provider === 'google') {
        await authAPI.googleLogin(callbackUrl);
      }
      // 未來可以添加其他提供者的處理邏輯
    } catch (error) {
      console.error('連接帳號失敗:', error);
    }
  };

  const handleDisconnectAccount = async (provider) => {
    try {
      await authAPI.disconnectAccount(provider);
      // 更新已連接的帳號列表
      setConnectedAccounts(prev => 
        prev.filter(account => account.provider !== provider)
      );
    } catch (error) {
      console.error('斷開帳號連接失敗:', error);
    }
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="settings-container">
      {/* 基本資料區塊 */}
      <section className="profile-section">
        <h2>個人資料</h2>
        <div className="profile-info">
          <img src={user?.photo} alt="Profile" className="profile-photo" />
          <div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
      </section>

      {/* 已連接的帳號區塊 */}
      <section className="connected-accounts">
        <h2>已連接的帳號</h2>
        <div className="accounts-list">
          {connectedAccounts.map(account => (
            <div key={account.provider} className="account-item">
              <img 
                src={`/${account.provider}-icon.svg`} 
                alt={account.provider} 
                className="provider-icon"
              />
              <span className="provider-name">
                {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
              </span>
              <button 
                onClick={() => handleDisconnectAccount(account.provider)}
                className="disconnect-btn"
              >
                斷開連接
              </button>
            </div>
          ))}
        </div>

        {/* 可連接的帳號區塊 */}
        <h2>連接其他帳號</h2>
        <div className="available-accounts">
          <button 
            className="connect-btn"
            onClick={() => handleConnectAccount('google')}
          >
            <img src="/google-icon.svg" alt="Google" />
            連接 Google 帳號
          </button>
          {/* 未來可以添加其他第三方登入按鈕 */}
        </div>
      </section>
    </div>
  );
};

export default UserSettings; 