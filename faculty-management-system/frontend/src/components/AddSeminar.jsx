import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddSeminar.css';

const AddSeminar = () => {
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    numberOfDays: '',
    date: '',
    organizedBy: '',
    mode: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      field: 'seminars',
      data: {
        title: formData.title,
        venue: formData.venue,
        numberOfDays: Number(formData.numberOfDays),
        date: formData.date,
        organizedBy: formData.organizedBy,
        mode: formData.mode,
      }
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/faculty/me/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert('Seminar entry saved successfully');
        navigate('/faculty-dashboard');
      } else {
        alert('Failed to save seminar entry');
      }
    } catch (error) {
      alert('Error saving seminar entry');
    }
  };

  const handleCancel = () => {
    navigate('/faculty-dashboard');
  };

  return (
    <div className="add-seminar-container">
      <button className="back-button" onClick={handleCancel}>← Back to Dashboard</button>
      <h1>Add Seminar</h1>
      <p>Fill in the details for your seminar entry.</p>
      <form onSubmit={handleSubmit} className="entry-form">
        <fieldset>
          <legend>Entry Details</legend>
          <label>
            Title *
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter title" />
          </label>
          <label>
            Venue *
            <input type="text" name="venue" value={formData.venue} onChange={handleChange} required placeholder="Enter venue" />
          </label>
          <label>
            Number of Days *
            <input type="number" name="numberOfDays" value={formData.numberOfDays} onChange={handleChange} required placeholder="Enter number of days" />
          </label>
          <label>
            Date *
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </label>
          <label>
            Organized By *
            <input type="text" name="organizedBy" value={formData.organizedBy} onChange={handleChange} required placeholder="Enter organized by" />
          </label>
          <label>
            Mode *
            <select name="mode" value={formData.mode} onChange={handleChange} required>
              <option value="">Select mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </label>
        </fieldset>
        <div className="form-buttons">
          <button type="submit" className="save-button">💾 Save Entry</button>
          <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddSeminar;
