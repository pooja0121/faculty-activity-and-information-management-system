import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPhdDegree.css';

const AddPhdDegree = () => {
  const [formData, setFormData] = useState({
    titleOfThesis: '',
    enrollNumber: '',
    supervisorName: '',
    vivaDate: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      field: 'phdDegrees',
      data: {
        titleOfThesis: formData.titleOfThesis,
        enrollNumber: formData.enrollNumber,
        supervisorName: formData.supervisorName,
        vivaDate: formData.vivaDate,
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
        alert('PhD degree entry saved successfully');
        navigate('/faculty-dashboard');
      } else {
        alert('Failed to save PhD degree entry');
      }
    } catch (error) {
      alert('Error saving PhD degree entry');
    }
  };

  const handleCancel = () => {
    navigate('/faculty-dashboard');
  };

  return (
    <div className="add-phd-degree-container">
      <button className="back-button" onClick={handleCancel}>← Back to Dashboard</button>
      <h1>Add PhD Degree</h1>
      <p>Fill in the details for your PhD degree entry.</p>
      <form onSubmit={handleSubmit} className="entry-form">
        <fieldset>
          <legend>Entry Details</legend>
          <label>
            Title of Thesis *
            <input type="text" name="titleOfThesis" value={formData.titleOfThesis} onChange={handleChange} required placeholder="Enter title of thesis" />
          </label>
          <label>
            Enrollment Number *
            <input type="text" name="enrollNumber" value={formData.enrollNumber} onChange={handleChange} required placeholder="Enter enrollment number" />
          </label>
          <label>
            Supervisor Name *
            <input type="text" name="supervisorName" value={formData.supervisorName} onChange={handleChange} required placeholder="Enter supervisor name" />
          </label>
          <label>
            Viva Date *
            <input type="date" name="vivaDate" value={formData.vivaDate} onChange={handleChange} required />
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

export default AddPhdDegree;
