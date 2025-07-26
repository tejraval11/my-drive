'use client';

import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import FileManager from './components/FileManager';
import Header from './components/Header';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    // Check for stored tokens on app load
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = (data) => {
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    setIsAuthenticated(true);
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const handleTokenRefresh = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
      } else {
        handleLogout();
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
      return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Drive</h1>
                <p className="text-gray-600">Secure file storage and management</p>
              </div>
              
              <div className="flex mb-6">
                <button
                  onClick={() => setShowLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
                    showLogin
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setShowLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
                    !showLogin
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Register
                </button>
              </div>

              {showLogin ? (
                <LoginForm onSuccess={handleAuthSuccess} />
              ) : (
                <RegisterForm onSuccess={handleAuthSuccess} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      <FileManager 
        accessToken={accessToken} 
        onTokenRefresh={handleTokenRefresh}
      />
    </div>
  );
}
