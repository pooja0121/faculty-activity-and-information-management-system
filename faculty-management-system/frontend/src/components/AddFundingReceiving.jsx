import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddFundingReceiving.css';

const AddFundingReceiving = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [pi, setPi] = useState('');
  const [coPi, setCoPi] = useState('');
  const [fundingAgency, setFundingAgency] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !pi || !fundingAgency || !appliedDate || !amount) {
      setError('Please fill in all required fields.');
      return;
    }

    const data = {
      field: 'fundingReceived',
      data: {
        title,
        pi,
        coPi,
        fundingAgency,
        appliedDate,
        amount,
      },
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/faculty/me/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess('Funding receiving entry saved successfully.');
        // Clear form
        setTitle('');
        setPi('');
        setCoPi('');
        setFundingAgency('');
        setAppliedDate('');
        setAmount('');
      } else {
        const resData = await response.json();
        setError(resData.message || 'Failed to save entry.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className="add-funding-receiving-container">
      <button className="back-button" onClick={() => navigate('/faculty-dashboard')}>
        &larr; Back to Dashboard
      </button>
      <h1>Add Funding Receiving</h1>
      <p>Fill in the details for your funding receiving entry.</p>
      <form className="entry-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Entry Details</legend>
          <label>
            Title *
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label>
            Principal Investigator (PI) *
            <input
              type="text"
              placeholder="Enter principal investigator (pi)"
              value={pi}
              onChange={(e) => setPi(e.target.value)}
              required
            />
          </label>
          <label>
            Co-Principal Investigator (Co-PI)
            <input
              type="text"
              placeholder="Enter co-principal investigator (co-pi)"
              value={coPi}
              onChange={(e) => setCoPi(e.target.value)}
            />
          </label>
          <label>
            Funding Agency *
            <input
              type="text"
              placeholder="Enter funding agency"
              value={fundingAgency}
              onChange={(e) => setFundingAgency(e.target.value)}
              required
            />
          </label>
          <label>
            Applied Date *
            <input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              required
            />
          </label>
          <label>
            Amount *
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
        </fieldset>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <div className="form-buttons">
          <button type="submit" className="save-button">
            Save Entry
          </button>
          <button type="button" className="cancel-button" onClick={() => navigate('/faculty-dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFundingReceiving;
