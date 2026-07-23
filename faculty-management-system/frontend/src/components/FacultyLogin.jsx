import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FacultyLogin.css';

const FacultyLogin = ({ onLogin, theme }) => {
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check for OAuth error in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setError(errorParam);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/faculty-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.token);
        localStorage.setItem('facultyId', facultyId);
        navigate('/faculty-dashboard');
      } else {
        setError('Invalid faculty ID or password');
      }
    } catch (error) {
      setError('Server error');
    }
  };



  return (
    <div className={`login-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="login-form">
        <div className="login-header">
          <div className="login-icon">🎓</div>
          <h2>Faculty Login</h2>
          <p>Enter your faculty credentials to manage your profile</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="facultyId">Faculty ID</label>
          <input
            type="text"
            id="facultyId"
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary">Login to Dashboard</button>
          <button type="button" className="btn-google" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google/faculty'}>
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>
        <button onClick={() => window.location.href = '/register'} className="register-button">Register</button>
      </div>
    </div>
  );
};

export default FacultyLogin;
