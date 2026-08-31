import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminId || !password) {
      setError('Please enter both Admin ID and password.');
      return;
    }

    try {
      const response = await fetch('https://faculty-information-and-activity-c1b1.onrender.com/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.token, data.role);
        localStorage.setItem('adminId', adminId);
        console.log('Admin login successful. Redirecting...');
        navigate('/admin-dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Server error. Please try again.');
      console.error('Admin login error:', error);
    }
  };

  return (
    <div className={`login-container ${localStorage.getItem('adminTheme') === 'dark' ? 'dark-theme' : ''}`}>
      <div className={`login-form ${localStorage.getItem('adminTheme') === 'dark' ? 'dark-theme' : ''}`}>
        <div className="login-header">
          <div className="login-icon">👑</div>
          <h2>Admin Login</h2>
          <p>Enter your admin credentials to manage the system</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="adminId">Admin ID</label>
          <input
            type="text"
            id="adminId"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
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
        </form>
        <a href="/" className="back-link">Back to Faculty Portal</a>
      </div>
    </div>
  );
};

export default AdminLogin;
