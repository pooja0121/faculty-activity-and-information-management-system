import React, { useState } from 'react';
import './AdminSettings.css';

const AdminSettings = ({ theme, setTheme }) => {
  const [settings, setSettings] = useState({
    notifications: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'theme') {
      setTheme(value);
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = () => {
    // In real app, save to backend
    alert('Settings saved!');
  };

  return (
    <div className={`admin-settings-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <h2>Admin Settings</h2>
      <div className="settings-form">
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
            />
            Enable Notifications
          </label>
        </div>
        <div className="setting-item">
          <label>Theme:</label>
          <select name="theme" value={theme} onChange={handleChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button onClick={handleSave} className="save-button">Save Settings</button>
      </div>
    </div>
  );
};

export default AdminSettings;
