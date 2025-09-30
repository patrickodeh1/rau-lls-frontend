import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
//import './LeadQueue.css';

const LeadQueue: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('access');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchLeads = async () => {
      try {
        const res = await api.get('/leads/queue/');
        setLeads(res.data);
      } catch (err) {
        setError('Failed to fetch leads');
        navigate('/login');
      }
    };
    fetchLeads();
  }, [token, navigate]);

  return (
    <div className="lead-queue-container">
      <h2>Lead Queue</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {leads.map((lead) => (
          <li key={lead.id}>{lead.name || 'N/A'} - {lead.status || 'N/A'}</li>
        ))}
      </ul>
    </div>
  );
};

export default LeadQueue;