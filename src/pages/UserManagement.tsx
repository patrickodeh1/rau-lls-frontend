import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
//import './UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('access');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/');
        setUsers(res.data);
      } catch (err) {
        setError('Failed to fetch users');
        navigate('/login');
      }
    };
    fetchUsers();
  }, [token, navigate]);

  return (
    <div className="user-management-container">
      <h2>User Management</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.email} - {u.role}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;