// src/pages/LeadDetails.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LeadDetails.css';

const LeadDetails: React.FC = () => {
  const [lead, setLead] = useState<any>(null);
  const [queue, setQueue] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leadResponse, queueResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/leads/next/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/leads/queue/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setLead(leadResponse.data);
        setQueue(queueResponse.data.remaining);
      } catch (err) {
        setError('Failed to load lead data');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  const handleDisposition = async (disposition: string, extraData: any = {}) => {
    if (lead) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/disposition/`, {
          row_index: lead.row_index,
          disposition,
          extra_data: extraData,
        }, { headers: { Authorization: `Bearer ${token}` } });
        const [leadResponse, queueResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/leads/next/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/leads/queue/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setLead(leadResponse.data);
        setQueue(queueResponse.data.remaining);
        if (disposition === 'BOOK') setShowPopup(true);
      } catch (err) {
        setError('Disposition failed');
      }
    }
  };

  const handleSchedule = () => {
    const date = prompt('Appointment Date (YYYY-MM-DD)');
    const time = prompt('Appointment Time (HH:MM)');
    const notes = prompt('Appointment Notes (optional)');
    if (date && time) {
      handleDisposition('BOOK', { Appointment_Date: date, Appointment_Time: time, Appointment_Notes: notes });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!token) return null;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="lead-details-container">
      <div className="header">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
        <span className="agent-name">Agent: {localStorage.getItem('name') || 'Unknown Agent'}</span>
      </div>
      {error && <p className="error">{error}</p>}
      <p>Queue Remaining: {queue}</p>
      <h2>{lead['Business Name']} - {lead['Phone Number']}</h2>
      <p><strong>Agent Script:</strong> {lead.agent_script || 'No script available'}</p>
      <p><strong>Lead History:</strong> {lead.history || 'No history'}</p>
      <button onClick={handleSchedule} className="schedule-btn">Schedule Appointment</button>
      <div className="disposition-buttons">
        <button onClick={() => handleDisposition('NA')}>Not Available</button>
        <button onClick={() => handleDisposition('NI')}>Not Interested</button>
        <button onClick={() => handleDisposition('DNC')}>Do Not Call</button>
        <button onClick={() => handleDisposition('CB')}>Call Back</button>
        <button onClick={() => handleDisposition('BOOK')}>Book Appointment</button>
      </div>
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Appointment Booked Successfully!</h3>
            <p>Details have been saved.</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetails;