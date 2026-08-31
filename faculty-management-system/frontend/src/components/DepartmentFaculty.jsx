import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEye, FaFilePdf, FaPlus } from 'react-icons/fa';
import './DepartmentFaculty.css';

const DepartmentFaculty = ({ token }) => {
  const { deptCode } = useParams();
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentStats, setDepartmentStats] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    facultyId: '',
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  // Map department codes to full names
  const departmentMap = {
    CSE: 'Computer Science & Engineering',
    IT: 'Information Technology',
    AIDS: 'Artificial Intelligence & Data Science',
    MECH: 'Mechanical Engineering',
    CIVIL: 'Civil Engineering',
    EEE: 'Electrical & Electronics Engineering',
    ECE: 'Electronics & Communication Engineering',
  };

  // Map department codes to banner URLs
  const bannerUrls = {
    CSE: 'https://img.jagranjosh.com/images/2023/January/312023/National-Engineering-College-NEC-Kovilpatti-Campus-View-1.jpg',
    ECE: 'https://img.jagranjosh.com/images/2023/January/312023/National-Engineering-College-NEC-Kovilpatti-Campus-View-1.jpg',
    MECH: 'https://img.jagranjosh.com/images/2023/January/312023/National-Engineering-College-NEC-Kovilpatti-Campus-View-1.jpg',
    AIDS: 'https://img.jagranjosh.com/images/2023/January/312023/National-Engineering-College-NEC-Kovilpatti-Campus-View-1.jpg',
    IT: 'https://img.jagranjosh.com/images/2023/January/312023/National-Engineering-College-NEC-Kovilpatti-Campus-View-1.jpg',
    CIVIL: 'https://img.jagranjosh.com/images/2023/January/312023/National-Engineering-College-NEC-Kovilpatti-Campus-View-1.jpg',
    EEE: 'https://img.jagranjosh.com/images/2023/January/312023/National-Engineering-College-NEC-Kovilpatti-Campus-View-1.jpg',
    // Add other department banner URLs as provided
  };

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch faculty data');
      }
      const data = await response.json();
      // Filter faculty by normalized department name or code
      const fullDeptName = departmentMap[deptCode.toUpperCase()] || deptCode;
      const normalizedFull = fullDeptName.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
      const normalizedCode = deptCode.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
      const filtered = data.filter(facultyItem => {
        const dept = facultyItem.user?.department || '';
        const normalizedDept = dept.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
        return normalizedDept === normalizedFull || normalizedDept === normalizedCode;
      });
      setFacultyList(filtered);
    } catch (err) {
      setError(err.message || 'Error fetching faculty data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (facultyId) => {
    if (!window.confirm('Are you sure you want to permanently delete this faculty?')) {
      return;
    }
    try {
      const response = await fetch(`https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/${facultyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete faculty');
      }
      await fetchFaculty(); // Refetch to update list
    } catch (err) {
      alert(err.message);
    }
  };



  const fetchDepartmentStats = async () => {
    try {
      const response = await fetch(`https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/stats/${deptCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDepartmentStats(data);
      }
    } catch (error) {
      console.error('Error fetching department stats:', error);
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://faculty-information-and-activity-c1b1.onrender.com/api/auth/add-faculty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newFaculty,
          department: departmentMap[deptCode.toUpperCase()] || deptCode,
        }),
      });
      if (response.ok) {
        alert('Faculty added successfully');
        setNewFaculty({ facultyId: '', name: '', email: '', password: '' });
        setShowAddForm(false);
        await fetchFaculty(); // Refetch faculty list
        await fetchDepartmentStats(); // Refetch stats to update count
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to add faculty');
      }
    } catch (error) {
      alert('Error adding faculty');
    }
  };

  useEffect(() => {
    fetchFaculty();
    fetchDepartmentStats();
  }, [deptCode, token]);

  // Refetch department stats when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchDepartmentStats();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [deptCode, token]);

  return (
    <div className={`department-faculty-container ${localStorage.getItem('adminTheme') === 'dark' ? 'dark-theme' : ''}`}>
      <div className="department-banner">
        <img
          src={bannerUrls[deptCode.toUpperCase()] || `/department-banners/${deptCode.toUpperCase()}.jpg`}
          alt="Department Banner"
          className="department-banner-image"
        />
        <div className="department-overlay">
          <h1>{departmentMap[deptCode.toUpperCase()] || deptCode.toUpperCase()}</h1>
        </div>
      </div>
      <header>
        <h1>Faculty Members - {deptCode.toUpperCase()} Department</h1>
        <div className="department-stats-header">
          <div className="stat-item">
            <span className="stat-label">Total Faculties:</span>
            <span className="stat-value">{departmentStats.totalFaculties || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Publications:</span>
            <span className="stat-value">{departmentStats.totalPublications || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Patents:</span>
            <span className="stat-value">{departmentStats.totalPatents || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Project Proposals:</span>
            <span className="stat-value">{departmentStats.totalProjectProposals || 0}</span>
          </div>
        </div>
        <button onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</button>
        <button onClick={() => setShowAddForm(!showAddForm)} className="add-faculty-btn">
          <FaPlus /> Add Faculty
        </button>
      </header>
      {showAddForm && (
        <div className="add-faculty-form">
          <h3>Add New Faculty to {deptCode.toUpperCase()} Department</h3>
          <form onSubmit={handleAddFaculty}>
            <input
              type="text"
              placeholder="Faculty ID"
              value={newFaculty.facultyId}
              onChange={(e) => setNewFaculty({ ...newFaculty, facultyId: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Name"
              value={newFaculty.name}
              onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newFaculty.email}
              onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newFaculty.password}
              onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
              required
            />
            <button type="submit">Add Faculty</button>
            <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
          </form>
        </div>
      )}
      {loading && <p>Loading faculty data...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="faculty-grid">
          {facultyList.length === 0 && <p className="no-faculty">No faculty found for this department.</p>}
          {facultyList.map((faculty) => {
            const user = faculty.user || {};
            const facultyId = user.facultyId || '';
            const hasProfilePic = user.profilePicture;
            return (
              <div key={faculty._id} className="faculty-card">
                <img
                  src={hasProfilePic ? `https://faculty-information-and-activity-c1b1.onrender.com${user.profilePicture}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+PC90ZXh0Pjwvc3ZnPg=='}
                  alt="Profile"
                  className="faculty-photo"
                />
                <h3 className="faculty-name">
                  {user.name || 'Unknown'}
                </h3>
                <div className="faculty-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => navigate(`/faculty/${facultyId}`)}
                    title="View Activities"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn pdf-btn"
                    onClick={() => {
                      if (window.confirm('Do you want to download the PDF?')) {
                        window.open(`https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/download-profile/${facultyId}`, '_blank');
                      }
                    }}
                    title="Download PDF"
                  >
                    <FaFilePdf />
                  </button>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(facultyId)}
                  style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepartmentFaculty;
