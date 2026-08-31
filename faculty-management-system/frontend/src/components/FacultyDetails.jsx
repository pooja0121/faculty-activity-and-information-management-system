import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './FacultyDetails.css';

const FacultyDetails = ({ token }) => {
  const { facultyId } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  // Apply theme to document body
  useEffect(() => {
    document.body.classList.remove('dark-theme');
  }, []);

  // Map full department names to codes (reverse of DepartmentFaculty)
  const deptCodeMap = {
    'Computer Science & Engineering': 'CSE',
    'Information Technology': 'IT',
    'Artificial Intelligence & Data Science': 'AIDS',
    'Mechanical Engineering': 'MECH',
    'Civil Engineering': 'CIVIL',
    'Electrical & Electronics Engineering': 'EEE',
    'Electronics & Communication Engineering': 'ECE',
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!token) {
          // Public access
          const response = await fetch(`https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/public-profile/${facultyId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch faculty profile');
          }
          const data = await response.json();
          setFaculty(data);

          // Aggregate events from faculty data
          const events = [];
          const addEvents = (arr, type) => {
            if (Array.isArray(arr)) {
              arr.forEach(item => {
                const event = { ...item, type };
                events.push(event);
              });
            }
          };

          addEvents(data.facultyDevelopmentPrograms, 'Faculty Development Program');
          addEvents(data.workshops, 'Workshop');
          addEvents(data.seminars, 'Seminar');
          addEvents(data.industryKnowHow, 'Industry Know How');
          addEvents(data.fellowships, 'Fellowship');
          addEvents(data.guestLectures, 'Guest Lecture');
          addEvents(data.publications, 'Publication');
          addEvents(data.patents, 'Patent');
          addEvents(data.projectProposals, 'Project Proposal');
          addEvents(data.fundingReceived, 'Funding Received');
          addEvents(data.phdDegrees, 'PhD Degree');

          setEvents(events);
        } else {
          // Admin access
          // Fetch all faculty and filter by facultyId
          const facultyResponse = await fetch('https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!facultyResponse.ok) {
            throw new Error('Failed to fetch faculty data');
          }
          const allFaculty = await facultyResponse.json();
          const facultyData = allFaculty.find(f => f.user?.facultyId === facultyId);
          if (!facultyData) {
            throw new Error('Faculty not found');
          }
          setFaculty(facultyData);

          // Fetch events
          const eventsResponse = await fetch(`https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/events/${facultyId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!eventsResponse.ok) {
            throw new Error('Failed to fetch events');
          }
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.events || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [facultyId, token]);

  const getBackDeptCode = () => {
    if (faculty && faculty.user && faculty.user.department) {
      return deptCodeMap[faculty.user.department] || 'CSE'; // Default fallback
    }
    return 'CSE';
  };

  // Prepare activity counts for bar chart
  const activityCounts = {
    'Faculty Development Programs': faculty?.facultyDevelopmentPrograms?.length || 0,
    'Workshops': faculty?.workshops?.length || 0,
    'Seminars': faculty?.seminars?.length || 0,
    'Industry Know How': faculty?.industryKnowHow?.length || 0,
    'Fellowships': faculty?.fellowships?.length || 0,
    'Guest Lectures': faculty?.guestLectures?.length || 0,
    'Publications': faculty?.publications?.length || 0,
    'Patents': faculty?.patents?.length || 0,
    'Project Proposals': faculty?.projectProposals?.length || 0,
    'Funding Received': faculty?.fundingReceived?.length || 0,
    'PhD Degrees': faculty?.phdDegrees?.length || 0,
  };

  const chartData = {
    labels: Object.keys(activityCounts),
    datasets: [
      {
        label: 'Activity Count',
        data: Object.values(activityCounts),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        stepSize: 1,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    maintainAspectRatio: false,
  };

  if (loading) return <div className="loading">Loading faculty details...</div>;
  if (error) return <div className="error">{error}</div>;

  const user = faculty?.user || {};

  return (
    <div className="faculty-details-container">
      <div className="department-banner">
        <img
          src={bannerUrls[getBackDeptCode()] || '/department-banner.jpg'}
          alt="Department Banner"
          className="department-banner-image"
        />
        <div className="department-overlay">
          <h1>{user.department || 'Department'}</h1>
        </div>
      </div>
      <header>
        <h1>Faculty Profile: {user.name || 'Unknown'}</h1>
        <div className="header-buttons">
          <button onClick={() => window.open(`https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/${token ? 'download-events' : 'download-profile'}/${facultyId}`, '_blank')}>
            Download PDF
          </button>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </header>

      {/* Profile Section */}
      <div className="faculty-profile-section">
        <div className="profile-layout">
          <div className="profile-photo-container">
            <img
              src={user.profilePicture ? `https://faculty-information-and-activity-c1b1.onrender.com${user.profilePicture}` : '/placeholder.jpg'}
              alt="Profile"
              className="faculty-profile-pic"
            />
          </div>
          <div className="faculty-header">
            <h2>{user.name || 'Unknown'}</h2>
            <p className="faculty-id">ID: {user.facultyId || 'null'}</p>
          </div>
          <div className="tab-buttons">
            <button
              className={activeTab === 'personal' ? 'active' : ''}
              onClick={() => setActiveTab('personal')}
            >
              Professional Information
            </button>
            <button
              className={activeTab === 'expertise' ? 'active' : ''}
              onClick={() => setActiveTab('expertise')}
            >
              Expertise Information
            </button>
            <button
              className={activeTab === 'publications' ? 'active' : ''}
              onClick={() => setActiveTab('publications')}
            >
              Publications
            </button>
            <button
              className={activeTab === 'experience' ? 'active' : ''}
              onClick={() => setActiveTab('experience')}
            >
              Experience
            </button>
            <button
              className={activeTab === 'doctoral' ? 'active' : ''}
              onClick={() => setActiveTab('doctoral')}
            >
              Doctoral Theses
            </button>
            <button
              className={activeTab === 'patents' ? 'active' : ''}
              onClick={() => setActiveTab('patents')}
            >
              Patents
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'personal' && (
              <div className="personal-info">
                <p><strong>Designation:</strong> {user.designation || 'null'}</p>
                <p><strong>Email:</strong> {user.email || 'null'}</p>
                <p><strong>Phone:</strong> {user.phone || 'null'}</p>
                <p><strong>Department:</strong> {user.department || 'null'}</p>
                <p><strong>Qualification:</strong> {user.qualification || 'null'}</p>
                <p><strong>Experience:</strong> {user.experience || 'null'}</p>
                <p><strong>Joining Date:</strong> {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'null'}</p>
                <p><strong>Specialization:</strong> {user.specialization || 'null'}</p>
                {user.bio && (
                  <div className="bio-section">
                    <strong>Bio:</strong>
                    <p>{user.bio}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'expertise' && (
              <div className="expertise-info">
                <p><strong>Specialization:</strong> {user.specialization || 'N/A'}</p>
                <p><strong>Qualification:</strong> {user.qualification || 'N/A'}</p>
                <p><strong>Experience:</strong> {user.experience || 'N/A'}</p>
              </div>
            )}
            {activeTab === 'publications' && (
              <div className="publications-info">
                {faculty?.publications?.length > 0 ? (
                  <ul>
                    {faculty.publications.map((pub, index) => (
                      <li key={index}>
                        <strong>{pub.title || 'Untitled'}</strong> - {pub.journal || pub.conference || 'N/A'} ({pub.year || 'N/A'})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No publications found.</p>
                )}
              </div>
            )}
            {activeTab === 'experience' && (
              <div className="experience-info">
                <p><strong>Experience:</strong> {user.experience || 'N/A'}</p>
                <p><strong>Joining Date:</strong> {user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            )}
            {activeTab === 'doctoral' && (
              <div className="doctoral-info">
                {faculty?.phdDegrees?.length > 0 ? (
                  <ul>
                    {faculty.phdDegrees.map((phd, index) => (
                      <li key={index}>
                        <strong>{phd.titleOfThesis || 'Untitled'}</strong> - {phd.university || 'N/A'} ({phd.yearOfCompletion || 'N/A'})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No doctoral theses found.</p>
                )}
              </div>
            )}
            {activeTab === 'patents' && (
              <div className="patents-info">
                {faculty?.patents?.length > 0 ? (
                  <ul>
                    {faculty.patents.map((patent, index) => (
                      <li key={index}>
                        <strong>{patent.title || 'Untitled'}</strong> - {patent.patentNumber || 'N/A'} ({patent.year || 'N/A'})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No patents found.</p>
                )}
              </div>
            )}
          </div>
          <div className="profile-chart">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="events-section">
        <h2>Events Attended by {user.name || 'Faculty'}</h2>
        {events.length === 0 ? (
          <p className="no-events">No events found for this faculty member.</p>
        ) : (
          <>
            <ul className="events-list">
              {events.map((event, index) => (
                <li key={index} className="event-item">
                  <div className="event-card">
                    <div className="event-header">
                      <h3>{event.title || event.titleOfThesis || event.name || 'Untitled Event'}</h3>
                      <span className="event-type">{event.type}</span>
                    </div>
                    <div className="event-details">
                      {Object.entries(event).map(([key, value]) => {
                        if (key === '_id' || key === 'userId' || key === 'createdAt' || key === 'updatedAt' || key === 'type' || !value) return null;

                        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

                        if (typeof value === 'object' && value !== null) {
                          return (
                            <div key={key} className="detail-item">
                              <strong>{formattedKey}:</strong>
                              <ul className="sub-details">
                                {Object.entries(value).map(([subKey, subValue]) => {
                                  if (subKey === '_id') return null;
                                  const subFormattedKey = subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/([A-Z])/g, ' $1');
                                  let subFormattedValue = subValue;
                                  if ((subKey === 'date' || subKey === 'vivaDate' || subKey === 'appliedDate') && subValue) {
                                    subFormattedValue = new Date(subValue).toLocaleDateString();
                                  } else if (typeof subValue === 'string' && subValue.length > 200) {
                                    subFormattedValue = `${subValue.substring(0, 200)}...`;
                                  }
                                  return <li key={subKey}><strong>{subFormattedKey}:</strong> {subFormattedValue}</li>;
                                })}
                              </ul>
                            </div>
                          );
                        } else {
                          let formattedValue = value;
                          if ((key === 'date' || key === 'vivaDate' || key === 'appliedDate') && value) {
                            formattedValue = new Date(value).toLocaleDateString();
                          } else if (typeof value === 'string' && value.length > 200 && key !== 'description') {
                            formattedValue = `${value.substring(0, 200)}...`;
                          }
                          return (
                            <p key={key} className="detail-item">
                              <strong>{formattedKey}:</strong> {formattedValue}
                            </p>
                          );
                        }
                      })}
                      {event.description && (
                        <div className="description-full">
                          <strong>Description:</strong>
                          <p>{event.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default FacultyDetails;
