import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddWorkshop.css';

const AddWorkshop = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    numberOfDays: '',
    date: '',
    organizedBy: '',
    mode: '',
  });

  const modes = ['Online', 'Offline', 'Hybrid'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    for (const key in formData) {
      if (!formData[key]) {
        alert(`Please fill the ${key} field.`);
        return;
      }
    }

    // Prepare data for API
    const dataToSend = {
      ...formData,
      numberOfDays: Number(formData.numberOfDays),
      date: formData.date,
    };

    try {
      // Call backend API to save entry
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/faculty/me/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          field: 'workshops',
          data: dataToSend,
        }),
      });

      if (response.ok) {
        alert('Entry saved successfully');
        navigate('/faculty-dashboard');
      } else {
        const errorData = await response.json();
        alert('Error saving entry: ' + errorData.message);
      }
    } catch (error) {
      alert('Error saving entry: ' + error.message);
    }
  };

  return (
    <div className="add-workshop-container">
      <button className="back-button" onClick={() => navigate('/faculty-dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h1>Add Workshop</h1>
      <p>Fill in the details for your workshop entry.</p>

      <form className="workshop-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Entry Details</legend>
          <p>Please provide accurate information for your workshop record.</p>

          <div className="form-row">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <label htmlFor="venue">Venue *</label>
            <input
              type="text"
              id="venue"
              name="venue"
              placeholder="Enter venue"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="numberOfDays">Number of Days *</label>
            <input
              type="number"
              id="numberOfDays"
              name="numberOfDays"
              placeholder="Enter number of days"
              value={formData.numberOfDays}
              onChange={handleChange}
              required
              min="1"
            />
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="organizedBy">Organized By *</label>
            <input
              type="text"
              id="organizedBy"
              name="organizedBy"
              placeholder="Enter organized by"
              value={formData.organizedBy}
              onChange={handleChange}
              required
            />
            <label htmlFor="mode">Mode *</label>
            <select
              id="mode"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              required
            >
              <option value="">Select mode</option>
              {modes.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
        </fieldset>

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">Save Entry</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/faculty-dashboard')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddWorkshop;
