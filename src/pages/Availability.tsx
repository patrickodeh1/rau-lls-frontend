import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Availability: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });
  const [error, setError] = useState('');
  const token = localStorage.getItem('access');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchSlots = async () => {
      try {
        const res = await api.get('/availability/');
        setSlots(res.data);
      } catch (err) {
        setError('Failed to fetch availability');
        navigate('/login');
      }
    };
    fetchSlots();
  }, [token, navigate]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/availability/', newSlot);
      setNewSlot({ date: '', time: '' });
      const res = await api.get('/availability/');
      setSlots(res.data);
    } catch (err) {
      setError('Error adding slot');
    }
  };

  return (
    <div className="availability-container">
      <h2>Manage Availability</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleAddSlot} className="slot-form">
        <input
          type="date"
          value={newSlot.date}
          onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
          required
        />
        <input
          type="time"
          value={newSlot.time}
          onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
          required
        />
        <button type="submit">Add Slot</button>
      </form>
      <ul>
        {slots.map((s, i) => (
          <li key={i}>{s.date} @ {s.time}</li>
        ))}
      </ul>
    </div>
  );
};

export default Availability;