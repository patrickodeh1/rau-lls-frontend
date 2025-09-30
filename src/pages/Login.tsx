// src/pages/EmployeeDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EmployeeDashboard.css'; // Import the CSS file

const EmployeeDashboard: React.FC = () => {
  const [agents, setAgents] = useState([]);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '' });
  const [token] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgents(response.data);
    };
    fetchAgents();
  }, [token]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...newAgent };
    if (data.password === '') {
      data.password = Math.random().toString(36).slice(-8); // Temp password
    }
    await axios.post(`${process.env.REACT_APP_API_URL}/api/users/`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNewAgent({ name: '', email: '', password: '' });
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAgents(response.data);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <ul>
          <li><a href="/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>RAU Admin</a></li>
          <li><a href="/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Employees</a></li>
          <li><a href="/leads" onClick={(e) => { e.preventDefault(); navigate('/leads'); }}>Live Lead System</a></li>
          <li><a href="/data-source" onClick={(e) => { e.preventDefault(); navigate('/data-source'); }}>Data Source</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a></li>
        </ul>
      </aside>
      <main className="main-content">
        <h2>Welcome Admin User</h2>
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
                <td>{agent.name}</td>
                <td>{agent.email}</td>
                <td>{agent.status}</td>
                <td>{agent.last_login}</td>
                <td><button>Reset</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default EmployeeDashboard;