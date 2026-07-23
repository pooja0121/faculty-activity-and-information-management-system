import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './PublicDepartmentFaculty.css';

const PublicDepartmentFaculty = () => {
  const { deptCode } = useParams();
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`http://localhost:5000/api/faculty/public/${deptCode}`);
        if (!response.ok) {
          throw new Error('Failed to fetch faculty data');
        }
        const data = await response.json();
        setFacultyList(data);
      } catch (err) {
        setError(err.message || 'Error fetching faculty data');
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [deptCode]);

  return (
    <div className="public-department-faculty-container">
      <header className="public-faculty-header">
        <h1>Faculty Members - {deptCode.toUpperCase()} Department</h1>
        <button onClick={() => navigate('/public-departments')}>Back to Departments</button>
      </header>
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
                  src={hasProfilePic ? `http://localhost:5000${user.profilePicture}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+PC90ZXh0Pjwvc3ZnPg=='}
                  alt="Profile"
                  className="faculty-photo"
                />
                <h3 className="faculty-name">
                  <Link to={`/public-faculty/${facultyId}`}>
                    {user.name || 'Unknown'}
                  </Link>
                </h3>
                <p className="faculty-designation">{user.designation || 'N/A'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicDepartmentFaculty;
