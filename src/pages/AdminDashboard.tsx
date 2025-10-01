import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  last_login: string | null;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '' });
  const [sheetConfig, setSheetConfig] = useState({ sheet_id: '', tab_name: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'config'>('agents');
  
  // Edit modal state
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  
  // Password display state
  const [agentPasswords, setAgentPasswords] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  
  const navigate = useNavigate();

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/');
      setAgents(response.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Unauthorized access');
        navigate('/login');
      } else {
        setError('Failed to fetch agents');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch sheet config
  const fetchSheetConfig = async () => {
    try {
      const response = await api.get('/sheet-config/');
      setSheetConfig({
        sheet_id: response.data.sheet_id || '',
        tab_name: response.data.tab_name || ''
      });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Failed to fetch sheet config');
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchAgents();
    fetchSheetConfig();
  }, [navigate]);

  // Create agent
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAgent.name || !newAgent.email) {
      setError('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/users/', newAgent);
      
      // Store the password for this agent
      if (response.data.temp_password) {
        setAgentPasswords(prev => ({
          ...prev,
          [response.data.id]: response.data.temp_password
        }));
        setMessage(`Agent created! Password: ${response.data.temp_password} (Click "View Password" to see again)`);
      } else {
        setMessage('Agent created successfully!');
      }
      
      setNewAgent({ name: '', email: '', password: '' });
      await fetchAgents();
      setTimeout(() => setMessage(''), 8000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error creating agent');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Edit agent - open modal
  const handleEditClick = (agent: Agent) => {
    setEditingAgent(agent);
    setEditForm({ name: agent.name, email: agent.email });
  };

  // Edit agent - save changes
  const handleSaveEdit = async () => {
    if (!editingAgent) return;

    try {
      setLoading(true);
      await api.put(`/users/${editingAgent.id}/`, editForm);
      setMessage(`Agent ${editForm.name} updated successfully!`);
      setEditingAgent(null);
      await fetchAgents();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error updating agent');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Toggle agent status (activate/deactivate)
  const handleToggleStatus = async (agent: Agent) => {
    const action = agent.status === 'active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${agent.name}?`)) {
      return;
    }

    try {
      const response = await api.patch(`/users/${agent.id}/toggle-status/`);
      setMessage(response.data.message);
      await fetchAgents();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Error toggling user status');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Delete agent
  const handleDeleteAgent = async (agent: Agent) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${agent.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/users/${agent.id}/`);
      setMessage(`Agent ${agent.name} deleted successfully`);
      
      // Remove stored password if exists
      setAgentPasswords(prev => {
        const newPasswords = { ...prev };
        delete newPasswords[agent.id];
        return newPasswords;
      });
      
      await fetchAgents();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Error deleting agent');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Reset password
  const handleResetPassword = async (agent: Agent) => {
    if (!window.confirm(`Reset password for ${agent.name}?`)) {
      return;
    }

    try {
      const response = await api.post('/reset-password/', { user_id: agent.id });
      
      // Store the new password
      setAgentPasswords(prev => ({
        ...prev,
        [agent.id]: response.data.temp_password
      }));
      
      setMessage(`Password reset for ${agent.name}! New password: ${response.data.temp_password}`);
      setTimeout(() => setMessage(''), 8000);
    } catch (err) {
      setError('Error resetting password');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (agentId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  // Save sheet config
  const handleSaveSheetConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sheetConfig.sheet_id.trim() || !sheetConfig.tab_name.trim()) {
      setError('Both Sheet ID and Tab Name are required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/sheet-config/', sheetConfig);
      setMessage('Sheet configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error saving configuration');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <h1>RAU-LLS Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={activeTab === 'agents' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('agents')}
        >
          Agent Management
        </button>
        <button
          className={activeTab === 'config' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('config')}
        >
          Google Sheet Config
        </button>
      </div>

      {/* Messages */}
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      {/* Agent Management Tab */}
      {activeTab === 'agents' && (
        <div className="tab-content">
          <section className="create-agent-section">
            <h2>Create New Agent</h2>
            <form onSubmit={handleCreateAgent} className="agent-form">
              <div className="form-group">
                <label>Full Name*</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password (optional - will generate if empty)</label>
                <input
                  type="password"
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                  placeholder="Leave blank to auto-generate"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating...' : 'Create Agent'}
              </button>
            </form>
          </section>

          <section className="agents-list-section">
            <h2>Current Agents ({agents.length})</h2>
            {loading ? (
              <p>Loading...</p>
            ) : agents.length === 0 ? (
              <p>No agents found. Create one above.</p>
            ) : (
              <table className="agents-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Password</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td>{agent.name}</td>
                      <td>{agent.email}</td>
                      <td>
                        <span className={`badge badge-${agent.role}`}>
                          {agent.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${agent.status}`}>
                          {agent.status}
                        </span>
                      </td>
                      <td>
                        {agent.last_login 
                          ? new Date(agent.last_login).toLocaleString() 
                          : 'Never'}
                      </td>
                      <td>
                        {agentPasswords[agent.id] ? (
                          <div className="password-cell">
                            <span className="password-display">
                              {visiblePasswords[agent.id] 
                                ? agentPasswords[agent.id] 
                                : '••••••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(agent.id)}
                              className="btn-icon"
                              title={visiblePasswords[agent.id] ? 'Hide password' : 'Show password'}
                            >
                              {visiblePasswords[agent.id] ? '🙈' : '👁️'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">Not available</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditClick(agent)}
                            className="btn-sm btn-edit"
                            title="Edit agent"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(agent)}
                            className={`btn-sm ${agent.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                            title={agent.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {agent.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
                          </button>
                          <button
                            onClick={() => handleResetPassword(agent)}
                            className="btn-sm btn-secondary"
                            title="Reset password"
                          >
                            🔑 Reset Password
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent)}
                            className="btn-sm btn-danger"
                            title="Delete agent"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {/* Google Sheet Config Tab */}
      {activeTab === 'config' && (
        <div className="tab-content">
          <section className="sheet-config-section">
            <h2>Google Sheet Configuration</h2>
            <p className="help-text">
              Configure the Google Sheet that contains your lead data. The sheet must have the required columns as specified in the documentation.
            </p>
            <form onSubmit={handleSaveSheetConfig} className="config-form">
              <div className="form-group">
                <label>Google Sheet ID*</label>
                <input
                  type="text"
                  value={sheetConfig.sheet_id}
                  onChange={(e) => setSheetConfig({ ...sheetConfig, sheet_id: e.target.value })}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  required
                />
                <small>Found in the sheet URL between /d/ and /edit</small>
              </div>
              <div className="form-group">
                <label>Tab Name*</label>
                <input
                  type="text"
                  value={sheetConfig.tab_name}
                  onChange={(e) => setSheetConfig({ ...sheetConfig, tab_name: e.target.value })}
                  placeholder="Leads"
                  required
                />
                <small>The name of the worksheet tab (e.g., "Leads", "Sheet1")</small>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Verifying...' : 'Save & Verify Connection'}
              </button>
            </form>

            <div className="config-info">
              <h3>Required Columns in Your Sheet:</h3>
              <ul>
                <li>Business Name</li>
                <li>Phone Number</li>
                <li>Message</li>
                <li>Notes/History</li>
                <li>Disposition</li>
                <li>CB_Date</li>
                <li>CB_Time</li>
                <li>Appointment_Date</li>
                <li>Appointment_Time</li>
                <li>Appointment_Notes</li>
                <li>Agent_ID</li>
                <li>Timestamp</li>
                <li>Lock_Status</li>
              </ul>
            </div>
          </section>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="modal-overlay" onClick={() => setEditingAgent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Agent</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveEdit} className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditingAgent(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;