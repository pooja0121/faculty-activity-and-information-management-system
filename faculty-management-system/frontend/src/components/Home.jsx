import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="header">
        <span className="header-icon">🎓</span>
        <h1 className="header-title">Faculty Information and Activity Management System</h1>
        <p className="header-subtitle">Comprehensive platform for faculty information, academic achievements, research, and professional development records.</p>
        <div className="header-buttons">
          <button className="header-btn" onClick={() => navigate("/admin-login")}>Admin Login</button>
          <button className="header-btn" onClick={() => navigate("/faculty-login")}>Faculty Login</button>
          <button className="header-btn" onClick={() => navigate("/public-departments")}>Public Portal</button>
        </div>
      </header>
    </div>
  );
};

export default Home;
