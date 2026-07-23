import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { FaMicrochip, FaBrain, FaBolt, FaCog, FaBuilding, FaBolt as FaBoltEEE, FaBroadcastTower, FaUser, FaCogs, FaSignOutAlt, FaTachometerAlt, FaBell, FaPaperPlane, FaSearch, FaFileExcel, FaChartBar } from 'react-icons/fa';


import AdminSettings from './AdminSettings';

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

import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'light');
  const [inactiveFaculty, setInactiveFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchParams, setSearchParams] = useState({
    facultyId: '',
    specialization: '',
    qualification: '',
    experience: ''
  });
  const [searchCriteria, setSearchCriteria] = useState({
    facultyId: false,
    specialization: false,
    qualification: false,
    experience: false
  });
  const [departmentStats, setDepartmentStats] = useState({});
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [overallStats, setOverallStats] = useState({ totalFaculties: 0, totalDepartments: 0 });
  const [departmentEventsSummary, setDepartmentEventsSummary] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  // Apply theme to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  // Fetch inactive faculty on component mount
  useEffect(() => {
    const fetchInactiveFaculty = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/faculty/inactive', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setInactiveFaculty(data);
        }
      } catch (error) {
        console.error('Error fetching inactive faculty:', error);
      }
    };

    fetchInactiveFaculty();
  }, []);

  // Fetch department stats and overall stats on component mount
  useEffect(() => {
    const fetchDepartmentStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const stats = {};
        let totalFaculties = 0;
        let totalPublications = 0;

        for (const dept of departments) {
          const response = await fetch(`http://localhost:5000/api/faculty/public-stats/${dept.code}`);
          if (response.ok) {
            const data = await response.json();
            stats[dept.code] = data;
            totalFaculties += data.totalFaculties || 0;
            totalPublications += data.totalPublications || 0;
          }
        }
        setDepartmentStats(stats);
        setOverallStats({ totalFaculties, totalDepartments: departments.length, totalPublications });
      } catch (error) {
        console.error('Error fetching department stats:', error);
      }
    };

    fetchDepartmentStats();
  }, []);

  // Fetch department events summary on component mount
  useEffect(() => {
    const fetchDepartmentEventsSummary = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/faculty/department-events-summary', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDepartmentEventsSummary(data);
        }
      } catch (error) {
        console.error('Error fetching department events summary:', error);
      }
    };

    fetchDepartmentEventsSummary();
  }, []);

  // Refetch department events summary when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      const fetchDepartmentEventsSummary = async () => {
        try {
          const token = localStorage.getItem('adminToken');
          const response = await fetch('http://localhost:5000/api/faculty/department-events-summary', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setDepartmentEventsSummary(data);
          }
        } catch (error) {
          console.error('Error fetching department events summary:', error);
        }
      };

      fetchDepartmentEventsSummary();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);



  // Refetch department stats when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      const fetchDepartmentStats = async () => {
        try {
          const stats = {};
          for (const dept of departments) {
            const response = await fetch(`http://localhost:5000/api/faculty/public-stats/${dept.code}`);
            if (response.ok) {
              const data = await response.json();
              stats[dept.code] = data;
            }
          }
          setDepartmentStats(stats);
        } catch (error) {
          console.error('Error fetching department stats:', error);
        }
      };

      fetchDepartmentStats();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleViewFaculty = async (deptCode) => {
    // Refetch all department stats to ensure up to date
    const fetchDepartmentStats = async () => {
      try {
        const stats = {};
        for (const dept of departments) {
          const response = await fetch(`http://localhost:5000/api/faculty/public-stats/${dept.code}`);
          if (response.ok) {
            const data = await response.json();
            stats[dept.code] = data;
          }
        }
        setDepartmentStats(stats);
      } catch (error) {
        console.error('Error fetching department stats:', error);
      }
    };

    await fetchDepartmentStats();
    navigate(`/department/${deptCode}`);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/admin-login');
  };

  const handleSendNotification = async (automatic = false) => {
    setLoading(true);
    setNotificationMessage('');

    const message = automatic
      ? 'You have been inactive for 3 months. Please update your academic activities.'
      : 'Reminder: Please update your academic activities regularly.';

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/faculty/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          facultyIds: inactiveFaculty.map(f => f.facultyId),
          message,
        }),
      });

      if (response.ok) {
        setNotificationMessage('Notifications sent successfully!');
      } else {
        setNotificationMessage('Failed to send notifications.');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      setNotificationMessage('Error sending notifications.');
    } finally {
      setLoading(false);
      setTimeout(() => setNotificationMessage(''), 3000);
    }
  };

  const handleAdvancedSearch = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams(searchParams).toString();
      const response = await fetch(`http://localhost:5000/api/faculty/search-advanced?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error searching faculty:', error);
    }
  };

  const handleViewFacultyDetails = (facultyId) => {
    navigate(`/faculty/${facultyId}`);
  };

  const handleSummaryReports = (deptCode) => {
    setSelectedDept(deptCode);
    setShowSummaryModal(true);
  };

  const handleDownloadSummary = async (eventType) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/faculty/summary/${selectedDept}/${eventType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedDept}_${eventType}_summary.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download summary');
      }
    } catch (error) {
      console.error('Error downloading summary:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
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
                <FaBuilding className="stat-icon" />
                <div className="stat-info">
                  <h3>{overallStats.totalDepartments}</h3>
                  <p>Total Departments</p>
                </div>
              </div>
              <div className="stat-card">
                <FaBell className="stat-icon" />
                <div className="stat-info">
                  <h3>{inactiveFaculty.length}</h3>
                  <p>Inactive Faculty</p>
                </div>
              </div>
              <div className="stat-card">
                <FaChartBar className="stat-icon" />
                <div className="stat-info">
                  <h3>{overallStats.totalPublications}</h3>
                  <p>Total Publications</p>
                </div>
              </div>
            </div>



            {/* Inactive Faculty Section */}
            {inactiveFaculty.length > 0 && (
              <div className="inactive-faculty-section">
                <h3><FaBell /> Inactive Faculty (3+ months)</h3>
                <div className="inactive-faculty-list">
                  {inactiveFaculty.slice(0, 5).map((faculty) => (
                    <div key={faculty.facultyId} className="inactive-faculty-item">
                      <span>{faculty.name} ({faculty.facultyId}) - {faculty.department}</span>
                      <span>Last Activity: {faculty.lastActivity}</span>
                    </div>
                  ))}
                  {inactiveFaculty.length > 5 && <p>... and {inactiveFaculty.length - 5} more</p>}
                </div>
                <button
                  className="notify-button"
                  onClick={() => handleSendNotification(true)}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : <><FaPaperPlane /> Send Reminder</>}
                </button>
                {notificationMessage && <p className="notification-message">{notificationMessage}</p>}
              </div>
            )}

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
                  <button
                    className="summary-reports-link"
                    onClick={() => handleSummaryReports(dept.code)}
                  >
                    <FaFileExcel /> Summary Reports
                  </button>
                </div>
              ))}
            </div>


          </div>
        );

      case 'search':
        return (
          <div className="search-section">
            <h2><FaSearch /> Advanced Faculty Search</h2>
            <div className="search-criteria">
              <h3>Select Search Criteria:</h3>
              <div className="criteria-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={searchCriteria.facultyId}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, facultyId: e.target.checked })}
                  />
                  Faculty ID
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={searchCriteria.specialization}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, specialization: e.target.checked })}
                  />
                  Specialization
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={searchCriteria.qualification}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, qualification: e.target.checked })}
                  />
                  Qualification
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={searchCriteria.experience}
                    onChange={(e) => setSearchCriteria({ ...searchCriteria, experience: e.target.checked })}
                  />
                  Experience
                </label>
              </div>
            </div>
            <div className="search-form">
              {searchCriteria.facultyId && (
                <input
                  type="text"
                  placeholder="Faculty ID"
                  value={searchParams.facultyId}
                  onChange={(e) => setSearchParams({ ...searchParams, facultyId: e.target.value })}
                />
              )}
              {searchCriteria.specialization && (
                <input
                  type="text"
                  placeholder="Specialization"
                  value={searchParams.specialization}
                  onChange={(e) => setSearchParams({ ...searchParams, specialization: e.target.value })}
                />
              )}
              {searchCriteria.qualification && (
                <input
                  type="text"
                  placeholder="Qualification"
                  value={searchParams.qualification}
                  onChange={(e) => setSearchParams({ ...searchParams, qualification: e.target.value })}
                />
              )}
              {searchCriteria.experience && (
                <input
                  type="text"
                  placeholder="Experience (e.g., 5 years)"
                  value={searchParams.experience}
                  onChange={(e) => setSearchParams({ ...searchParams, experience: e.target.value })}
                />
              )}
              <button onClick={handleAdvancedSearch}>Search</button>
            </div>
            <div className="search-results">
              {searchResults.length > 0 ? (
                <div>
                  <h3>Search Results:</h3>
                  <ul>
                    {searchResults.map((faculty) => (
                      <li key={faculty.facultyId} className="faculty-list-item">
                        <span>{faculty.name} ({faculty.facultyId}) - {faculty.department}</span>
                        <button onClick={() => handleViewFacultyDetails(faculty.facultyId)}>View Details</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No results found.</p>
              )}
            </div>
          </div>
        );

      case 'department-summary':
        return (
          <div className="department-summary-page">
            <h2><FaChartBar /> Department Events Summary</h2>
            {departmentEventsSummary.length > 0 ? (
              <div className="summary-table">
                <table>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Publications</th>
                      <th>Patents</th>
                      <th>Project Proposals</th>
                      <th>Workshops</th>
                      <th>Seminars</th>
                      <th>Faculty Development Programs</th>
                      <th>Industry Know How</th>
                      <th>Fellowships</th>
                      <th>Guest Lectures</th>
                      <th>PhD Degrees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentEventsSummary.map((summary, index) => (
                      <tr key={index}>
                        <td>{summary.department}</td>
                        <td>{summary.publications}</td>
                        <td>{summary.patents}</td>
                        <td>{summary.projectProposals}</td>
                        <td>{summary.workshops}</td>
                        <td>{summary.seminars}</td>
                        <td>{summary.facultyDevelopmentPrograms}</td>
                        <td>{summary.industryKnowHow}</td>
                        <td>{summary.fellowships}</td>
                        <td>{summary.guestLectures}</td>
                        <td>{summary.phdDegrees}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No data available.</p>
            )}
          </div>
        );

      case 'settings':
        return <AdminSettings theme={theme} setTheme={setTheme} />;
      default:
        return null;
    }
  };

  return (
    <div className={`admin-dashboard-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <header className="admin-dashboard-header">
        <h1>Faculty Information and Activity Management System</h1>
        <p>Admin Dashboard</p>
      </header>
      <div className="dashboard-body">
        <nav className="sidebar-nav">
          <div className="nav-header">
            <h3>Admin Panel</h3>
          </div>
          <ul className="nav-menu">
            <li
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <span className="nav-icon"><FaTachometerAlt /></span>
              <span className="nav-text">Dashboard</span>
            </li>

            <li
              className={`nav-item ${activeSection === 'search' ? 'active' : ''}`}
              onClick={() => setActiveSection('search')}
            >
              <span className="nav-icon"><FaSearch /></span>
              <span className="nav-text">Advanced Search</span>
            </li>

            <li
              className={`nav-item ${activeSection === 'department-summary' ? 'active' : ''}`}
              onClick={() => setActiveSection('department-summary')}
            >
              <span className="nav-icon"><FaChartBar /></span>
              <span className="nav-text">Department Summary</span>
            </li>

            <li
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <span className="nav-icon"><FaCogs /></span>
              <span className="nav-text">Settings</span>
            </li>
            <li className="nav-item logout" onClick={handleLogout}>
              <span className="nav-icon"><FaSignOutAlt /></span>
              <span className="nav-text">Logout</span>
            </li>
          </ul>
        </nav>
        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {showSummaryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Download Summary Reports for {selectedDept}</h3>
            <div className="modal-buttons">
              <button onClick={() => handleDownloadSummary('publications')}>Publications</button>
              <button onClick={() => handleDownloadSummary('patents')}>Patents</button>
              <button onClick={() => handleDownloadSummary('project-proposals')}>Project Proposals</button>
              <button onClick={() => handleDownloadSummary('funding-received')}>Funding Received</button>
              <button onClick={() => handleDownloadSummary('workshops')}>Workshops</button>
              <button onClick={() => handleDownloadSummary('seminars')}>Seminars</button>
              <button onClick={() => handleDownloadSummary('faculty-development-programs')}>Faculty Development Programs</button>
              <button onClick={() => handleDownloadSummary('industry-know-how')}>Industry Know How</button>
              <button onClick={() => handleDownloadSummary('fellowships')}>Fellowships</button>
              <button onClick={() => handleDownloadSummary('guest-lectures')}>Guest Lectures</button>
              <button onClick={() => handleDownloadSummary('phd-degrees')}>PhD Degrees</button>
            </div>
            <button className="close-modal" onClick={() => setShowSummaryModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
