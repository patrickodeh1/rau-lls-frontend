import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Use centralized api instance
import { useNavigate } from 'react-router-dom';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('access'); // Use "access"
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments/'); // Use api instance
        setAppointments(res.data);
      } catch (err) {
        setError('Failed to fetch appointments');
        navigate('/login');
      }
    };
    fetchAppointments();
  }, [token, navigate]);

  return (
    <div className="appointments-container">
      <h2>Appointments</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Lead</th>
            <th>Date</th>
            <th>Time</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id}>
              <td>{appt.lead_name}</td>
              <td>{appt.date}</td>
              <td>{appt.time}</td>
              <td>{appt.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;