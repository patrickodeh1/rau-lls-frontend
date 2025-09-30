import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './EmployeeDashboard.css';

const EmployeeDashboard: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAgents = async () => {
    try {
      const response = await api.get('/users/');
      setAgents(response.data);
    } catch (err) {
      setError('Failed to fetch agents');
      navigate('/login');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAgents();
  }, [navigate]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...newAgent };
    if (!data.password) {
      data.password = Math.random().toString(36).slice(-8);
    }
    try {
      await api.post('/users/', data);
      setNewAgent({ name: '', email: '', password: '' });
      fetchAgents();
      setMessage('Agent created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Error creating agent');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResetPassword = async (agentId: string) => {
    try {
      await api.post('/reset-password/', { user_id: agentId });
      setMessage('Password reset request sent');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Error resetting password');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getActiveLink = (path: string) => (location.pathname === path ? 'active' : '');

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <ul>
          <li>
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard');
              }}
              className={getActiveLink('/dashboard')}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/users"
              onClick={(e) => {
                e.preventDefault();
                navigate('/users');
              }}
              className={getActiveLink('/users')}
            >
              User Management
            </a>
          </li>
          <li>
            <a
              href="/leads"
              onClick={(e) => {
                e.preventDefault();
                navigate('/leads');
              }}
              className={getActiveLink('/leads')}
            >
              Leads
            </a>
          </li>
          <li>
            <a
              href="/lead-queue"
              onClick={(e) => {
                e.preventDefault();
                navigate('/lead-queue');
              }}
              className={getActiveLink('/lead-queue')}
            >
              Lead Queue
            </a>
          </li>
          <li>
            <a
              href="/disposition"
              onClick={(e) => {
                e.preventDefault();
                navigate('/disposition');
              }}
              className={getActiveLink('/disposition')}
            >
              Lead Disposition
            </a>
          </li>
          <li>
            <a
              href="/data-source"
              onClick={(e) => {
                e.preventDefault();
                navigate('/data-source');
              }}
              className={getActiveLink('/data-source')}
            >
              Data Source
            </a>
          </li>
          <li>
            <a
              href="/availability"
              onClick={(e) => {
                e.preventDefault();
                navigate('/availability');
              }}
              className={getActiveLink('/availability')}
            >
              Availability
            </a>
          </li>
          <li>
            <a
              href="/appointments"
              onClick={(e) => {
                e.preventDefault();
                navigate('/appointments');
              }}
              className={getActiveLink('/appointments')}
            >
              Appointments
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              Logout
            </a>
          </li>
        </ul>
      </aside>
      <main className="main-content">
        <h2>Welcome Admin User</h2>
        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleCreateAgent} className="agent-form">
          <input
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            placeholder="Full Name"
            required
          />
          <input
            value={newAgent.email}
            onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
            placeholder="Email"
            required
          />
          <input
            value={newAgent.password}
            onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
            placeholder="Password (leave blank to generate)"
          />
          <button type="submit">Create Agent</button>
        </form>
        <h3>Current Agents</h3>
        <table className="agents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Reset Password</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent: any) => (
              <tr key={agent.id}>
                <td>{agent.name || 'N/A'}</td>
                <td>{agent.email || 'N/A'}</td>
                <td>{agent.status || 'Active'}</td>
                <td>{agent.last_login || 'N/A'}</td>
                <td>
                  <button onClick={() => handleResetPassword(agent.id)}>Reset</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default EmployeeDashboard;