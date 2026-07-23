import React from 'react';
import './AdminProfile.css';

const AdminProfile = () => {
  // Mock data, in real app fetch from API
  const adminData = {
    name: 'Admin User',
    email: 'admin@nec.edu.in',
    facultyId: 'admin',
    role: 'Administrator'
  };

  return (
    <div className="admin-profile-container">
      <h2>Admin Profile</h2>
      <div className="profile-details">
        <div className="profile-item">
          <label>Name:</label>
          <span>{adminData.name}</span>
        </div>
        <div className="profile-item">
          <label>Email:</label>
          <span>{adminData.email}</span>
        </div>
        <div className="profile-item">
          <label>Admin ID:</label>
          <span>{adminData.facultyId}</span>
        </div>
        <div className="profile-item">
          <label>Role:</label>
          <span>{adminData.role}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
