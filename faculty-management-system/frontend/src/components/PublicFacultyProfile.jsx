import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PublicFacultyProfile.css';

const PublicFacultyProfile = () => {
  const { facultyId } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacultyProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`http://localhost:5000/api/faculty/public-profile/${facultyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch faculty profile');
        }
        const data = await response.json();
        setFaculty(data);
      } catch (err) {
        setError(err.message || 'Error fetching faculty profile');
      } finally {
        setLoading(false);
      }
    };
    fetchFacultyProfile();
  }, [facultyId]);

  const renderNestedDetails = (obj, key) => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      return (
        <ul className="sub-details">
          {Object.entries(obj).map(([subKey, subValue]) => (
            <li key={subKey}>
              <strong>{subKey}:</strong> {typeof subValue === 'object' ? renderNestedDetails(subValue, subKey) : subValue}
            </li>
          ))}
        </ul>
      );
    }
    return obj;
  };

  const renderArraySection = (array, title) => {
    if (!Array.isArray(array) || array.length === 0) return null;
    return (
      <section className="array-section">
        <h3>{title}</h3>
        <ul className="array-list">
          {array.map((item, index) => (
            <li key={index} className="array-item">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="detail-item">
                  <strong>{key}:</strong> {renderNestedDetails(value, key)}
                </div>
              ))}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  if (loading) return <div className="loading">Loading faculty profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!faculty || !faculty.user) return <div className="error">Faculty not found</div>;

  const user = faculty.user;

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/faculty/download-profile/${facultyId}`;
    link.download = `${user.name.replace(/\s+/g, '_')}_Profile.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="public-faculty-profile-container">
      <header>
        <button onClick={() => navigate(-1)}>Back</button>
        <h1>{user.name} - Faculty Profile</h1>
        <button onClick={handleDownloadPDF} className="download-pdf-btn">Download PDF</button>
      </header>
      <div className="profile-section">
        <div className="profile-header">
          {user.profilePicture && (
            <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="profile-picture" />
          )}
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p><strong>ID:</strong> {user.facultyId}</p>
            <p><strong>Designation:</strong> {user.designation || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
            <p><strong>Department:</strong> {user.department || 'N/A'}</p>
            <p><strong>Qualification:</strong> {user.qualification || 'N/A'}</p>
            <p><strong>Experience:</strong> {user.experience || 'N/A'}</p>
            <p><strong>Joining Date:</strong> {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Specialization:</strong> {user.specialization || 'N/A'}</p>
            <p><strong>Bio:</strong> {user.bio || 'N/A'}</p>
          </div>
        </div>
      </div>

      {renderArraySection(faculty.facultyDevelopmentPrograms, 'Faculty Development Programs')}
      {renderArraySection(faculty.workshops, 'Workshops')}
      {renderArraySection(faculty.seminars, 'Seminars')}
      {renderArraySection(faculty.industryKnowHow, 'Industry Know How')}
      {renderArraySection(faculty.fellowships, 'Fellowships')}
      {renderArraySection(faculty.guestLectures, 'Guest Lectures')}
      {renderArraySection(faculty.publications, 'Publications')}
      {renderArraySection(faculty.patents, 'Patents')}
      {renderArraySection(faculty.projectProposals, 'Project Proposals')}
      {renderArraySection(faculty.fundingReceived, 'Funding Received')}
      {renderArraySection(faculty.phdDegrees, 'PhD Degrees')}
    </div>
  );
};

export default PublicFacultyProfile;
