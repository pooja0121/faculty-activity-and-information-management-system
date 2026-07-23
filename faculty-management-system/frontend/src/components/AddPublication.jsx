import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPublication.css';

const AddPublication = () => {
  const [formData, setFormData] = useState({
    title: '',
    authorDetails: '',
    volumeNumber: '',
    issueNumber: '',
    year: '',
    doi: '',
    journal: '',
    type: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      field: 'publications',
      data: {
        title: formData.title,
        authorDetails: formData.authorDetails,
        volumeNumber: formData.volumeNumber,
        issueNumber: formData.issueNumber,
        year: Number(formData.year),
        doi: formData.doi,
        journal: formData.journal,
        type: formData.type,
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
        alert('Publication entry saved successfully');
        navigate('/faculty-dashboard');
      } else {
        alert('Failed to save publication entry');
      }
    } catch (error) {
      alert('Error saving publication entry');
    }
  };

  const handleCancel = () => {
    navigate('/faculty-dashboard');
  };

  return (
    <div className="add-publication-container">
      <button className="back-button" onClick={handleCancel}>← Back to Dashboard</button>
      <h1>Add Publication</h1>
      <p>Fill in the details for your publication entry.</p>
      <form onSubmit={handleSubmit} className="entry-form">
        <fieldset>
          <legend>Entry Details</legend>
          <label>
            Title *
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter title" />
          </label>
          <label>
            Author Details *
            <textarea name="authorDetails" value={formData.authorDetails} onChange={handleChange} required placeholder="Enter author details" />
          </label>
          <label>
            Volume Number *
            <input type="text" name="volumeNumber" value={formData.volumeNumber} onChange={handleChange} required placeholder="Enter volume number" />
          </label>
          <label>
            Issue Number *
            <input type="text" name="issueNumber" value={formData.issueNumber} onChange={handleChange} required placeholder="Enter issue number" />
          </label>
          <label>
            Year *
            <input type="number" name="year" value={formData.year} onChange={handleChange} required placeholder="Enter year" />
          </label>
          <label>
            DOI *
            <input type="text" name="doi" value={formData.doi} onChange={handleChange} required placeholder="Enter DOI" />
          </label>
          <label>
            Journal *
            <input type="text" name="journal" value={formData.journal} onChange={handleChange} required placeholder="Enter journal" />
          </label>
          <label>
            Type *
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="">Select type</option>
              <option value="National">National</option>
              <option value="International">International</option>
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

export default AddPublication;
