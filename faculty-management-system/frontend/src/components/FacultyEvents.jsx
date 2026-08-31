import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './FacultyEvents.css';

const FacultyEvents = ({ token }) => {
  const { facultyId } = useParams();
  const [facultyName, setFacultyName] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showGraph, setShowGraph] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'light');

  // Apply theme to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/events/${facultyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch events data');
        }
        const data = await response.json();
        console.log('Fetched events data:', data);
        setFacultyName(data.facultyName || '');
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Error fetching events data');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [facultyId, token]);

  // Prepare monthly data for chart
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthlyCounts = new Array(12).fill(0);

  events.forEach(event => {
    const eventDate = new Date(event.date);
    if (!isNaN(eventDate)) {
      const monthIndex = eventDate.getMonth();
      monthlyCounts[monthIndex]++;
    }
  });

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Number of Events',
        data: monthlyCounts,
        fill: false,
        borderColor: 'rgba(54, 162, 235, 0.8)',
        backgroundColor: 'rgba(54, 162, 235, 0.4)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        stepSize: 1,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = `https://faculty-information-and-activity-c1b1.onrender.com/api/faculty/download-events/${facultyId}`;
    link.download = `${facultyName.replace(/\s+/g, '_')}_Events.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="faculty-events-container">
      <header>
        <h1>Events Attended by Faculty: {facultyName || facultyId}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              background: theme === 'dark' ? '#2a2a2a' : '#f8fafc',
              color: theme === 'dark' ? '#e0e0e0' : '#2563eb',
              border: `2px solid ${theme === 'dark' ? '#60a5fa' : '#2563eb'}`,
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={handleDownloadPDF} className="download-pdf-btn">Download PDF</button>
          <button className="back-button" onClick={() => navigate(-1)}>Back to Faculty List</button>
        </div>
      </header>
      {loading && <p className="loading">Loading events data...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          {events.length === 0 ? (
            <p className="no-events">No events found for this faculty member.</p>
          ) : (
            <>
              <ul className="events-list">
                {events.map((event, index) => (
                  <li key={index} className="event-item">
                    <div className="event-card">
                      <div className="event-header">
                        <h3>{event.title || event.titleOfThesis || event.name || 'Untitled Event'}</h3>
                        <span className="event-type">{event.type}</span>
                      </div>
                      <div className="event-details">
                        {Object.entries(event).map(([key, value]) => {
                          if (key === '_id' || key === 'userId' || key === 'createdAt' || key === 'updatedAt' || key === 'type' || !value) return null;

                          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

                          if (typeof value === 'object' && value !== null) {
                            return (
                              <div key={key} className="detail-item">
                                <strong>{formattedKey}:</strong>
                                <ul className="sub-details">
                                  {Object.entries(value).map(([subKey, subValue]) => {
                                    if (subKey === '_id') return null;
                                    const subFormattedKey = subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/([A-Z])/g, ' $1');
                                    let subFormattedValue = subValue;
                                    if ((subKey === 'date' || subKey === 'vivaDate' || subKey === 'appliedDate') && subValue) {
                                      subFormattedValue = new Date(subValue).toLocaleDateString();
                                    } else if (typeof subValue === 'string' && subValue.length > 200) {
                                      subFormattedValue = `${subValue.substring(0, 200)}...`;
                                    }
                                    return <li key={subKey}><strong>{subFormattedKey}:</strong> {subFormattedValue}</li>;
                                  })}
                                </ul>
                              </div>
                            );
                          } else {
                            let formattedValue = value;
                            if ((key === 'date' || key === 'vivaDate' || key === 'appliedDate') && value) {
                              formattedValue = new Date(value).toLocaleDateString();
                            } else if (typeof value === 'string' && value.length > 200 && key !== 'description') {
                              formattedValue = `${value.substring(0, 200)}...`;
                            }
                            return (
                              <p key={key} className="detail-item">
                                <strong>{formattedKey}:</strong> {formattedValue}
                              </p>
                            );
                          }
                        })}
                        {event.description && (
                          <div className="description-full">
                            <strong>Description:</strong>
                            <p>{event.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="graph-toggle" onClick={() => setShowGraph(!showGraph)}>
                {showGraph ? 'Hide Graph' : 'Show Graph'}
              </button>
              {showGraph && (
                <div className="events-chart">
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FacultyEvents;
