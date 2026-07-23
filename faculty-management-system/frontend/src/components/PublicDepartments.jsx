import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PublicDepartments.css';
import { FaMicrochip, FaBrain, FaBolt, FaCog, FaBuilding, FaBolt as FaBoltEEE, FaBroadcastTower, FaUser, FaBuilding as FaDept, FaChartBar } from 'react-icons/fa';

const departments = [
  {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    icon: <FaMicrochip />,
  },
  {
    code: 'IT',
    name: 'Information Technology',
    icon: <FaBrain />,
  },
  {
    code: 'AIDS',
    name: 'Artificial Intelligence & Data Science',
    icon: <FaBolt />,
  },
  {
    code: 'MECH',
    name: 'Mechanical Engineering',
    icon: <FaCog />,
  },
  {
    code: 'CIVIL',
    name: 'Civil Engineering',
    icon: <FaBuilding />,
  },
  {
    code: 'EEE',
    name: 'Electrical & Electronics Engineering',
    icon: <FaBoltEEE />,
  },
  {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    icon: <FaBroadcastTower />,
  },
];

const PublicDepartments = () => {
  const [activeSection, setActiveSection] = useState('departments');
  const [departmentStats, setDepartmentStats] = useState({});
  const [overallStats, setOverallStats] = useState({ totalFaculties: 0, totalDepartments: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartmentStats = async () => {
      try {
        const stats = {};
        let totalFaculties = 0;
        for (const dept of departments) {
          const response = await fetch(`http://localhost:5000/api/faculty/public-stats/${dept.code}`);
          if (response.ok) {
            const data = await response.json();
            stats[dept.code] = data;
            totalFaculties += data.totalFaculties || 0;
          }
        }
        setDepartmentStats(stats);
        setOverallStats({ totalFaculties, totalDepartments: departments.length });
      } catch (error) {
        console.error('Error fetching department stats:', error);
      }
    };

    fetchDepartmentStats();
  }, []);

  const handleViewFaculty = (deptCode) => {
    navigate(`/public-department/${deptCode}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'departments':
        return (
          <div className="dashboard-content">
            {/* Overall Stats Section */}
            <div className="overall-stats">
              <div className="stat-card">
                <FaUser className="stat-icon" />
                <div className="stat-info">
                  <h3>{overallStats.totalFaculties}</h3>
                  <p>Total Faculties</p>
                </div>
              </div>
              <div className="stat-card">
                <FaDept className="stat-icon" />
                <div className="stat-info">
                  <h3>{overallStats.totalDepartments}</h3>
                  <p>Total Departments</p>
                </div>
              </div>
            </div>

            <div className="departments-grid">
              {departments.map((dept) => (
                <div key={dept.code} className="department-card">
                  <div className="department-icon">{dept.icon}</div>
                  <div className="department-code">{dept.code}</div>
                  <div className="department-name">{dept.name}</div>
                  <button
                    className="view-faculty-link"
                    onClick={() => handleViewFaculty(dept.code)}
                  >
                    View Faculty
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header">
        <h1>Faculty Information and Activity Management System</h1>
        <p>Public Portal</p>
        <button className="back-to-home-btn" onClick={() => navigate('/')}>Back to Home</button>
      </header>
      <div className="dashboard-body">
        <nav className="sidebar-nav">
          <div className="nav-header">
            <h3>Public Panel</h3>
          </div>
          <ul className="nav-menu">
            <li
              className={`nav-item ${activeSection === 'departments' ? 'active' : ''}`}
              onClick={() => setActiveSection('departments')}
            >
              <span className="nav-icon"><FaDept /></span>
              <span className="nav-text">Departments</span>
            </li>
          </ul>
        </nav>
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default PublicDepartments;
