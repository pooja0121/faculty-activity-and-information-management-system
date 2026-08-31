import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProjectProposal.css';

const AddProjectProposal = () => {
  const [formData, setFormData] = useState({
    title: '',
    pi: '',
    coPi: '',
    fundingAgency: '',
    appliedDate: '',
    amount: '',
    status: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      field: 'projectProposals',
      data: {
        title: formData.title,
        pi: formData.pi,
        coPi: formData.coPi,
        fundingAgency: formData.fundingAgency,
        appliedDate: formData.appliedDate,
        amount: formData.amount,
        status: formData.status,
      }
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/me/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert('Project proposal entry saved successfully');
        navigate('/faculty-dashboard');
      } else {
        alert('Failed to save project proposal entry');
      }
    } catch (error) {
      alert('Error saving project proposal entry');
    }
  };

  const handleCancel = () => {
    navigate('/faculty-dashboard');
  };

  return (
    <div className="add-project-proposal-container">
      <button className="back-button" onClick={handleCancel}>← Back to Dashboard</button>
      <h1>Add Project Proposal</h1>
      <p>Fill in the details for your project proposal entry.</p>
      <form onSubmit={handleSubmit} className="entry-form">
        <fieldset>
          <legend>Entry Details</legend>
          <label>
            Title *
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter title" />
          </label>
          <label>
            Principal Investigator (PI) *
            <input type="text" name="pi" value={formData.pi} onChange={handleChange} required placeholder="Enter principal investigator (pi)" />
          </label>
          <label>
            Co-Principal Investigator (Co-PI)
            <input type="text" name="coPi" value={formData.coPi} onChange={handleChange} placeholder="Enter co-principal investigator (co-pi)" />
          </label>
          <label>
            Funding Agency *
            <input type="text" name="fundingAgency" value={formData.fundingAgency} onChange={handleChange} required placeholder="Enter funding agency" />
          </label>
          <label>
            Applied Date *
            <input type="date" name="appliedDate" value={formData.appliedDate} onChange={handleChange} required />
          </label>
          <label>
            Amount *
            <input type="text" name="amount" value={formData.amount} onChange={handleChange} required placeholder="Enter amount" />
          </label>
          <label>
            Status *
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="">Select status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
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

export default AddProjectProposal;
