import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CompleteRegistration.css'; // Create this CSS file

const CompleteRegistration = ({ onLogin }) => {
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const role = searchParams.get('role');
  const name = searchParams.get('name');

  useEffect(() => {
    if (token) {
      fetchUserInfo();
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setError('Failed to fetch user information');
      }
    } catch (error) {
      setError('Server error');
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!facultyId || !password) {
      setError('Faculty ID and password are required');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/complete-google-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ facultyId, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Registration completed successfully! Logging in...');
        onLogin(data.token, data.role);
        localStorage.setItem('facultyId', facultyId);
        navigate('/faculty-dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (error) {
      setError('Server error');
    }
  };

  return (
    <div className="complete-registration-container">
      <div className="complete-registration-box">
        <h2>Complete Your Registration</h2>
        {user && (
          <p>Welcome, {user.name}! Your email: {user.email}</p>
        )}
        <form onSubmit={handleCompleteRegistration}>
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
          {message && <p className="message">{message}</p>}
          <button type="submit">Complete Registration</button>
        </form>
      </div>
    </div>
  );
};

export default CompleteRegistration;
