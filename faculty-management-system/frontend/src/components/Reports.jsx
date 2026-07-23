import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = ({ token }) => {
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const addReport = async () => {
    try {
      await axios.post('/api/reports', newReport, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewReport({ title: '', description: '' });
      fetchReports();
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  return (
    <div className="reports-container">
      <h2>Reports</h2>
      <div className="add-report">
        <input
          type="text"
          placeholder="Report Title"
          value={newReport.title}
          onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newReport.description}
          onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
        />
        <button onClick={addReport}>Add Report</button>
      </div>
      <ul className="reports-list">
        {reports.map((report) => (
          <li key={report._id}>
            <h3>{report.title}</h3>
            <p>{report.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reports;
