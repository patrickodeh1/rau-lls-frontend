import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Disposition: React.FC = () => {
  const [leadId, setLeadId] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('access');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leads/disposition/', { lead_id: leadId, status });
      setMessage('Disposition updated successfully');
      setError('');
    } catch (err) {
      setError('Error updating disposition');
      setMessage('');
    }
  };

  if (!token) {
    navigate('/login');
    return null;
  }

  return (
    <div className="disposition-container">
      <h2>Lead Disposition</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          placeholder="Lead ID"
        />
        <input
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Status"
        />
        <button type="submit">Update</button>
      </form>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Disposition;