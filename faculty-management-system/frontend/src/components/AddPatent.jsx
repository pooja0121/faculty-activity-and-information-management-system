import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPatent.css';

const AddPatent = () => {
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    author: '',
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
      field: 'patents',
      data: {
        title: formData.title,
        year: Number(formData.year),
        author: formData.author,
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
        alert('Patent entry saved successfully');
        navigate('/faculty-dashboard');
      } else {
        alert('Failed to save patent entry');
      }
    } catch (error) {
      alert('Error saving patent entry');
    }
  };

  const handleCancel = () => {
    navigate('/faculty-dashboard');
  };

  return (
    <div className="add-patent-container">
      <button className="back-button" onClick={handleCancel}>← Back to Dashboard</button>
      <h1>Add Patent</h1>
      <p>Fill in the details for your patent entry.</p>
      <form onSubmit={handleSubmit} className="entry-form">
        <fieldset>
          <legend>Entry Details</legend>
          <label>
            Title *
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter title" />
          </label>
          <label>
            Year *
            <input type="number" name="year" value={formData.year} onChange={handleChange} required placeholder="Enter year" />
          </label>
          <label>
            Author *
            <input type="text" name="author" value={formData.author} onChange={handleChange} required placeholder="Enter author" />
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

export default AddPatent;
