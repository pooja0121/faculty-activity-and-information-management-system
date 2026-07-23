import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Assuming we create a CSS file

const Register = ({ onLogin }) => {
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!facultyId || !password) {
      setError('Faculty ID and password are required');
      return;
    }

    if (email && !email.endsWith('@nec.edu.in')) {
      setError('Email must end with @nec.edu.in');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId, password, email }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Registration successful! Logging in...');
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
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>
        <form onSubmit={handleRegisterSubmit}>
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
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          {message && <p className="message">{message}</p>}
          <button type="submit">Register</button>
        </form>
        <a href="/faculty-login">Back to Login</a>
      </div>
    </div>
  );
};

export default Register;
