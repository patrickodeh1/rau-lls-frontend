import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './DataSource.css';

const DataSource: React.FC = () => {
  const [config, setConfig] = useState({ sheet_id: '', tab_name: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await api.get('/sheet-config/');
        setConfig(response.data);
      } catch (err) {
        setError('Failed to fetch config');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [token, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.sheet_id.trim() || !config.tab_name.trim()) {
      setError('Both fields are required');
      return;
    }
    try {
      setLoading(true);
      await api.post('/sheet-config/', config);
      setMessage('Config saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Error saving config');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="data-source-container">
      <h2>Data Source</h2>
      <form onSubmit={handleSave} className="data-form">
        <input
          value={config.sheet_id}
          onChange={(e) => setConfig({ ...config, sheet_id: e.target.value })}
          placeholder="Google Sheet ID"
          required
        />
        <input
          value={config.tab_name}
          onChange={(e) => setConfig({ ...config, tab_name: e.target.value })}
          placeholder="Lead Tab Name"
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </form>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default DataSource;