import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './LeadDetails.css';

const LeadDetails: React.FC = () => {
  const [lead, setLead] = useState<any>(null);
  const [queue, setQueue] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('access');
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
          api.get('/leads/queue/'), // Changed from /leads/next/
          api.get('/leads/queue/'),
        ]);
        setLead(leadResponse.data[0] || null); // Assuming first lead in queue
        setQueue(queueResponse.data.length);
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
        await api.post('/leads/disposition/', {
          lead_id: lead.id, // Changed from row_index to lead_id
          status: disposition, // Changed to match DispositionView
          extra_data: extraData,
        });
        const [leadResponse, queueResponse] = await Promise.all([
          api.get('/leads/queue/'),
          api.get('/leads/queue/'),
        ]);
        setLead(leadResponse.data[0] || null);
        setQueue(queueResponse.data.length);
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
      {lead ? (
        <>
          <h2>{lead['Business Name'] || 'N/A'} - {lead['Phone Number'] || 'N/A'}</h2>
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
        </>
      ) : (
        <p>No leads available</p>
      )}
    </div>
  );
};

export default LeadDetails;