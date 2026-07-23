import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './FacultyDashboard.css';

const FacultyDashboard = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewingEntries, setViewingEntries] = useState(null); // null or category id
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    designation: '',
    qualification: '',
    experience: '',
    joiningDate: '',
    specialization: '',
    bio: '',
    profilePicture: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [inactiveNotification, setInactiveNotification] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleThemeChange = (theme) => {
    setDarkMode(theme === 'dark');
  };

  const fetchFacultyData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/faculty/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch faculty data');
      }
      const data = await response.json();
      setFacultyData(data);

      // Initialize profile data with fetched data
      setProfileData({
        name: data.user?.name || '',
        email: data.user?.email || '',
        phone: data.user?.phone || '',
        address: data.user?.address || '',
        department: data.user?.department || '',
        designation: data.user?.designation || '',
        qualification: data.user?.qualification || '',
        experience: data.user?.experience || '',
        joiningDate: data.user?.joiningDate ? data.user.joiningDate.split('T')[0] : '',
        specialization: data.user?.specialization || '',
        bio: data.user?.bio || '',
        profilePicture: data.user?.profilePicture || ''
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, [token]);

  // Check for inactivity notifications on component mount
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/faculty/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const notifications = await response.json();
          if (notifications.length > 0) {
            setInactiveNotification(notifications[0].message);
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    checkNotifications();
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const counts = {
    facultyDevelopmentPrograms: facultyData?.facultyDevelopmentPrograms?.length || 0,
    workshops: facultyData?.workshops?.length || 0,
    seminars: facultyData?.seminars?.length || 0,
    industryKnowHow: facultyData?.industryKnowHow?.length || 0,
    fellowships: facultyData?.fellowships?.length || 0,
    publications: facultyData?.publications?.length || 0,
    patents: facultyData?.patents?.length || 0,
    projectProposals: facultyData?.projectProposals?.length || 0,
    fundingReceiving: facultyData?.fundingReceived?.length || 0,
    phdDegrees: facultyData?.phdDegrees?.length || 0,
    guestLectures: facultyData?.guestLectures?.length || 0,
  };

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: '📊', path: null },
    { id: 'faculty-development', name: 'Faculty Development Program', icon: '📚', path: '/add-faculty-development-program', count: counts.facultyDevelopmentPrograms },
    { id: 'workshop', name: 'Workshop', icon: '👥', path: '/add-workshop', count: counts.workshops },
    { id: 'seminar', name: 'Seminar', icon: '🎤', path: '/add-seminar', count: counts.seminars },
    { id: 'industry', name: 'Industry Know How', icon: '🏢', path: '/add-industry-know-how', count: counts.industryKnowHow },
    { id: 'fellowship', name: 'Fellowship', icon: '🎖️', path: '/add-fellowship', count: counts.fellowships },
    { id: 'publication', name: 'Publication', icon: '📄', path: '/add-publication', count: counts.publications },
    { id: 'patent', name: 'Patent', icon: '📈', path: '/add-patent', count: counts.patents },
    { id: 'project', name: 'Project Proposal', icon: '💼', path: '/add-project-proposal', count: counts.projectProposals },
    { id: 'funding', name: 'Funding Receiving', icon: '💲', path: '/add-funding-receiving', count: counts.fundingReceiving },
    { id: 'phd', name: 'PhD Degree', icon: '🎓', path: '/add-phd-degree', count: counts.phdDegrees },
    { id: 'guest-lecture', name: 'Guest Lecture', icon: '🎙️', path: '/add-guest-lecture-deliver', count: counts.guestLectures },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const handleNavigation = (item) => {
    setActiveSection(item.id);
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleViewEntries = (categoryId) => {
    setViewingEntries(categoryId);
    setActiveSection('overview'); // Stay on overview but show entries
  };

  const handleCloseEntries = () => {
    setViewingEntries(null);
  };

  const accountItems = [
    { id: 'profile', name: 'Profile', icon: '👤', action: () => setActiveSection('profile') },
    { id: 'settings', name: 'Settings', icon: '⚙️', action: () => setActiveSection('settings') },
    { id: 'logout', name: 'Logout', icon: '🚪', action: handleLogout, isLogout: true },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setSaveMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/faculty/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();

      // Update the faculty data state with the new information
      setFacultyData(updatedData);

      // Update profileData from the response to ensure consistency
      setProfileData({
        name: updatedData.user?.name || '',
        email: updatedData.user?.email || '',
        phone: updatedData.user?.phone || '',
        address: updatedData.user?.address || '',
        department: updatedData.user?.department || '',
        designation: updatedData.user?.designation || '',
        qualification: updatedData.user?.qualification || '',
        experience: updatedData.user?.experience || '',
        joiningDate: updatedData.user?.joiningDate ? updatedData.user.joiningDate.split('T')[0] : '',
        specialization: updatedData.user?.specialization || '',
        bio: updatedData.user?.bio || '',
        profilePicture: updatedData.user?.profilePicture || ''
      });

      setSaveMessage('Profile updated successfully!');
      setIsEditingProfile(false);

      // Refetch to ensure latest data from server
      setTimeout(() => {
        fetchFacultyData();
      }, 1000);

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);

    } catch (err) {
      setSaveMessage(`Error updating profile: ${err.message}`);
      console.error('Profile update error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!selectedFile) {
      setSaveMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      setSaveLoading(true);
      const response = await fetch('http://localhost:5000/api/faculty/upload-profile-picture', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const result = await response.json();
      setProfileData(prev => ({ ...prev, profilePicture: result.profilePicture }));
      setFacultyData(result.facultyData);
      setSelectedFile(null);
      setSaveMessage('Profile picture uploaded successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage(`Error uploading profile picture: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset profile data to original values
    if (facultyData) {
      setProfileData({
        name: facultyData.user?.name || '',
        email: facultyData.user?.email || '',
        phone: facultyData.user?.phone || '',
        address: facultyData.user?.address || '',
        department: facultyData.user?.department || '',
        designation: facultyData.user?.designation || '',
        qualification: facultyData.user?.qualification || '',
        experience: facultyData.user?.experience || '',
        joiningDate: facultyData.user?.joiningDate ? facultyData.user.joiningDate.split('T')[0] : '',
        specialization: facultyData.user?.specialization || '',
        bio: facultyData.user?.bio || '',
        profilePicture: facultyData.user?.profilePicture || ''
      });
    }
    setSelectedFile(null);
    setIsEditingProfile(false);
    setSaveMessage('');
  };

  const renderOverview = () => {
    if (viewingEntries) {
      // Show past entries for the selected category
      const category = navigationItems.find(item => item.id === viewingEntries);
      if (!category) {
        return <p>Invalid category selected.</p>;
      }

      // Mapping for data keys
      const dataKeys = {
        'faculty-development': 'facultyDevelopmentPrograms',
        'workshop': 'workshops',
        'seminar': 'seminars',
        'industry': 'industryKnowHow',
        'fellowship': 'fellowships',
        'publication': 'publications',
        'patent': 'patents',
        'project': 'projectProposals',
        'funding': 'fundingReceived',
        'phd': 'phdDegrees',
        'guest-lecture': 'guestLectures',
      };

      const dataKey = dataKeys[viewingEntries] || viewingEntries.replace(/-/g, '');
      const entries = facultyData?.[dataKey] || [];

      return (
        <div className="entries-view">
          <h2>Past Entries: {category.name}</h2>
          <button className="btn btn-outline" onClick={handleCloseEntries}>Close</button>
          {entries.length === 0 ? (
            <p>No past entries found.</p>
          ) : (
            <ul className="entries-list">
              {entries.map((entry, index) => (
                <li key={index} className="entry-item">
                  <div className="entry-card">
                    <h4>{entry.title || 'No Title'}</h4>
                    <div className="entry-details">
                      {Object.entries(entry).map(([key, value]) => {
                        if (key === '_id' || key === 'userId' || key === 'createdAt' || key === 'updatedAt' || key === 'title' || !value) return null;
                        
                        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                        let formattedValue = value;
                        
                        if (key === 'date' && value) {
                          formattedValue = new Date(value).toLocaleDateString();
                        } else if (typeof value === 'string' && value.length > 200) {
                          formattedValue = `${value.substring(0, 200)}...`;
                        }
                        
                        return (
                          <p key={key}>
                            <strong>{formattedKey}:</strong> {formattedValue}
                          </p>
                        );
                      })}
                      {entry.description && (
                        <div className="description-full">
                          <strong>Description:</strong>
                          <p>{entry.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    return (
      <div className="overview-content">
        <h2>Academic Portfolio</h2>
        <p>Manage your professional achievements, research work, and academic activities.</p>

        <div className="portfolio-cards">
          {navigationItems.slice(1).map((item) => (
            <div key={item.id} className="portfolio-card" style={{ cursor: 'pointer' }}>
              <div className="card-icon">{item.icon}</div>
              <div className="card-content">
                <h3>{item.name}</h3>
                <p>Click to add or manage your {item.name.toLowerCase()} records</p>
                <div className="card-buttons">
                  <button className="btn btn-outline" onClick={() => handleNavigation(item)}>+ Add Entry</button>
                  <button className="btn btn-outline" onClick={() => handleViewEntries(item.id)}>View Past Entries</button>
                </div>
              </div>
              <div className="entry-count">{item.count} entries</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {facultyData?.user?.profilePicture ? (
                <img 
                  src={`http://localhost:5000${facultyData.user.profilePicture}`} 
                  alt="Profile Avatar" 
                  className="avatar-img"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <div className="avatar-fallback">
                  {facultyData?.user?.name ? facultyData.user.name.charAt(0).toUpperCase() : 'F'}
                </div>
              )}
            </div>
          </div>
          <div className="profile-info-main">
            <h2 className="profile-name">{facultyData?.user?.name || 'N/A'}</h2>
            <p className="profile-faculty-id">{localStorage.getItem('facultyId') || 'N/A'}</p>
            <p className="profile-designation">{facultyData?.user?.designation || 'N/A'}</p>
            <p className="profile-department">{facultyData?.user?.department || 'N/A'}</p>
            <div className="profile-contact">
              <span className="contact-item">📧 {facultyData?.user?.email || 'N/A'}</span>
              <span className="contact-item">📞 {facultyData?.user?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button
            className="btn-edit-profile"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{counts.publications}</h3>
            <p>Publications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <div className="stat-content">
            <h3>{counts.patents}</h3>
            <p>Patents</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{counts.projectProposals}</h3>
            <p>Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>{counts.phdDegrees}</h3>
            <p>Ph.D. Guided</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content-sections">
        {/* Personal Information */}
        <div className="profile-section">
          <div className="section-header">
            <h3>👤 Personal Information</h3>
            <p>Your basic profile information</p>
          </div>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                ) : (
                  <p>{facultyData?.user?.name || 'N/A'}</p>
                )}
              </div>
              <div className="form-group">
                <label>Faculty ID</label>
                <p>{localStorage.getItem('facultyId') || 'N/A'}</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    placeholder="Enter email"
                  />
                ) : (
                  <p>{facultyData?.user?.email || 'sarah.johnson@university.edu'}</p>
                )}
              </div>
              <div className="form-group">
                <label>Phone</label>
                {isEditingProfile ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p>{facultyData?.user?.phone || 'N/A'}</p>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Address</label>
                {isEditingProfile ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    placeholder="Enter address"
                    rows="3"
                  />
                ) : (
                  <p>{facultyData?.user?.address || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3>📸 Profile Picture</h3>
            <p>Upload and manage your profile picture</p>
          </div>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group full-width">
                <label>Profile Picture</label>
                {profileData.profilePicture ? (
                  <img 
                    src={`http://localhost:5000${profileData.profilePicture}`} 
                    alt="Profile Picture" 
                    style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', display: 'block', marginBottom: '10px' }} 
                  />
                ) : (
                  <p>No profile picture</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ marginBottom: '10px' }}
                />
                <button
                  className="btn btn-outline"
                  onClick={handleUploadProfilePicture}
                  disabled={!selectedFile || saveLoading}
                  style={{ marginBottom: '10px' }}
                >
                  {saveLoading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="profile-section">
          <div className="section-header">
            <h3>🏢 Professional Information</h3>
            <p>Your academic and professional details</p>
          </div>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                    placeholder="Enter department"
                  />
                ) : (
                  <p>{facultyData?.user?.department || 'N/A'}</p>
                )}
              </div>
              <div className="form-group">
                <label>Designation</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.designation}
                    onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                    placeholder="Enter designation"
                  />
                ) : (
                  <p>{facultyData?.user?.designation || 'Associate Professor'}</p>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Qualification</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.qualification}
                    onChange={(e) => setProfileData({...profileData, qualification: e.target.value})}
                    placeholder="Enter qualification"
                  />
                ) : (
                  <p>{facultyData?.user?.qualification || 'Ph.D. in Computer Science'}</p>
                )}
              </div>
              <div className="form-group">
                <label>Experience</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                    placeholder="Enter experience"
                  />
                ) : (
                  <p>{facultyData?.user?.experience || '12 years'}</p>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Joining Date</label>
                {isEditingProfile ? (
                  <input
                    type="date"
                    value={profileData.joiningDate}
                    onChange={(e) => setProfileData({...profileData, joiningDate: e.target.value})}
                  />
                ) : (
                  <p>{facultyData?.user?.joiningDate ? new Date(facultyData.user.joiningDate).toLocaleDateString() : '15-08-2012'}</p>
                )}
              </div>
              <div className="form-group">
                <label>Specialization</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.specialization}
                    onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
                    placeholder="Enter specialization"
                  />
                ) : (
                  <p>{facultyData?.user?.specialization || 'Machine Learning, Data Science'}</p>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Bio</label>
                {isEditingProfile ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Enter bio"
                    rows="4"
                  />
                ) : (
                  <p>{facultyData?.user?.bio || 'Experienced professor with expertise in machine learning and data science. Published over 50 research papers and guided numerous Ph.D. students.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      {isEditingProfile && (
        <div className="profile-actions-bottom">
          <button className="btn-cancel" onClick={handleCancelEdit}>
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSaveProfile}
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Save Message */}
      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
          {saveMessage}
        </div>
      )}
    </div>
  );

  return (
    <div className="faculty-dashboard-container">
      <header className="faculty-dashboard-header">
        <div className="header-left">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <h1>Faculty Dashboard</h1>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          <div className="user-avatar-small" style={{ marginRight: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: facultyData?.user?.profilePicture ? 'transparent' : '#007bff' }}>
              {facultyData?.user?.profilePicture ? (
                <img 
                  src={`http://localhost:5000${facultyData.user.profilePicture}`} 
                  alt="Avatar" 
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                />
              ) : (
                <span style={{ color: 'white', fontWeight: 'bold' }}>
                  {facultyData?.user?.name ? facultyData.user.name.charAt(0).toUpperCase() : 'F'}
                </span>
              )}
            </div>
          </div>
          <div className="faculty-id-box">{localStorage.getItem('facultyId') || 'Guest'}</div>
        </div>
      </header>

      {/* Inactivity Notification */}
      {inactiveNotification && (
        <div className="notification-banner">
          <div className="notification-content">
            <span className="notification-icon">⚠️</span>
            <span className="notification-message">{inactiveNotification}</span>
            <button
              className="notification-close"
              onClick={() => setInactiveNotification('')}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-body">
        <nav className={`sidebar-nav ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="nav-header">
            <h3>Academic Activities</h3>
          </div>
          <ul className="nav-menu">
            {navigationItems.map((item) => (
              <li
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleNavigation(item)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                {item.count !== undefined && <span className="nav-count">{item.count}</span>}
              </li>
            ))}
          </ul>

          {/* Account Section - More Prominent */}
          <div className="nav-account-section">
            <div className="nav-section-title">Account</div>
            <ul className="nav-menu">
              <li className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`} onClick={() => setActiveSection('profile')}>
                <span className="nav-icon">👤</span>
                <span className="nav-text">Profile</span>
              </li>
              <li className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`} onClick={() => setActiveSection('settings')}>
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Settings</span>
              </li>
              <li className="nav-item logout" onClick={handleLogout}>
                <span className="nav-icon">🚪</span>
                <span className="nav-text">Logout</span>
              </li>
            </ul>
          </div>
        </nav>

        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'settings' && (
            <div className="settings-content">
              <h2>Settings</h2>
              <div className="settings-options">
                <div className="setting-item">
                  <label>Theme:</label>
                  <select
                    value={darkMode ? 'dark' : 'light'}
                    onChange={(e) => handleThemeChange(e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Notifications:</label>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </div>
          )}

          <section className="quick-stats">
            <h2>Quick Statistics</h2>
            <p>Overview of your academic contributions and achievements</p>
            <div className="stats-cards">
              <div className="stats-card total-entries">
                <h3>{Object.values(counts).reduce((a, b) => a + b, 0)}</h3>
                <p>Total Entries</p>
              </div>
              <div className="stats-card publications">
                <h3>{counts.publications}</h3>
                <p>Publications</p>
              </div>
              <div className="stats-card events-attended">
                <h3>{counts.seminars + counts.workshops}</h3>
                <p>Events Attended</p>
              </div>
              <div className="stats-card active-projects">
                <h3>{counts.projectProposals}</h3>
                <p>Active Projects</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
