import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './LeadDetails.css';

const LeadDetails: React.FC = () => {
  const [lead, setLead] = useState<any>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCallBackModal, setShowCallBackModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking form data
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  
  // Call back form data
  const [callBackDate, setCallBackDate] = useState('');
  const [callBackTime, setCallBackTime] = useState('');
  
  const navigate = useNavigate();
  const agentName = localStorage.getItem('name') || 'Agent';

  // Fetch next lead
  const fetchNextLead = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/leads/next/');
      setLead(response.data.lead);
      setQueueCount(response.data.queue_count || 0);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setLead(null);
        setQueueCount(0);
      } else if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load lead');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchNextLead();
  }, [navigate]);

  // Handle simple dispositions (NA, NI, DNC)
  const handleDisposition = async (disposition: string) => {
    if (!lead) return;

    try {
      await api.post('/leads/disposition/', {
        row_index: lead.row_index,
        disposition: disposition,
        extra_data: {}
      });
      
      // Immediately fetch next lead
      await fetchNextLead();
    } catch (err) {
      setError('Failed to update disposition');
    }
  };

  // Handle Call Back
  const handleCallBack = () => {
    setShowCallBackModal(true);
  };

  const submitCallBack = async () => {
    if (!callBackDate || !callBackTime) {
      setError('Please select both date and time for callback');
      return;
    }

    try {
      await api.post('/leads/disposition/', {
        row_index: lead.row_index,
        disposition: 'CB',
        extra_data: {
          CB_Date: callBackDate,
          CB_Time: callBackTime
        }
      });
      
      // Reset form and close modal
      setCallBackDate('');
      setCallBackTime('');
      setShowCallBackModal(false);
      
      // Fetch next lead
      await fetchNextLead();
    } catch (err) {
      setError('Failed to schedule callback');
    }
  };

  // Handle Book Appointment
  const handleBookAppointment = () => {
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!appointmentDate || !appointmentTime) {
      setError('Please select both date and time for appointment');
      return;
    }

    try {
      await api.post('/leads/disposition/', {
        row_index: lead.row_index,
        disposition: 'BOOK',
        extra_data: {
          Appointment_Date: appointmentDate,
          Appointment_Time: appointmentTime,
          Appointment_Notes: appointmentNotes || ''
        }
      });
      
      // Reset form and close modal
      setAppointmentDate('');
      setAppointmentTime('');
      setAppointmentNotes('');
      setShowBookingModal(false);
      
      // Show success overlay
      setShowSuccessOverlay(true);
      
      // Auto-hide success overlay and fetch next lead after 2 seconds
      setTimeout(async () => {
        setShowSuccessOverlay(false);
        await fetchNextLead();
      }, 2000);
    } catch (err) {
      setError('Failed to book appointment');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const makePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  if (loading) {
    return (
      <div className="lead-details-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="lead-details-container">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>RAU Live Lead System</h1>
          <span className="agent-name">Agent: {agentName}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Error Display */}
      {error && <div className="error-banner">{error}</div>}

      {/* Queue Counter */}
      <div className="queue-info">
        <span>Leads in Queue: {queueCount}</span>
      </div>

      {/* Lead Display or No Leads Message */}
      {lead ? (
        <div className="lead-card">
          {/* Business Info */}
          <div className="lead-header">
            <h2>{lead['Business Name'] || 'N/A'}</h2>
            <button 
              className="phone-btn"
              onClick={() => makePhoneCall(lead['Phone Number'])}
            >
              📞 {lead['Phone Number'] || 'N/A'}
            </button>
          </div>

          {/* Script/Message */}
          <div className="lead-section">
            <h3>Script:</h3>
            <p className="script-text">{lead.Message || lead.message || 'No script available'}</p>
          </div>

          {/* History/Notes */}
          {lead['Notes/History'] && (
            <div className="lead-section">
              <h3>Lead History:</h3>
              <p className="history-text">{lead['Notes/History']}</p>
            </div>
          )}

          {/* Disposition Buttons */}
          <div className="disposition-section">
            <h3>Disposition:</h3>
            <div className="disposition-buttons">
              <button 
                className="disp-btn disp-na"
                onClick={() => handleDisposition('NA')}
              >
                Not Available
              </button>
              <button 
                className="disp-btn disp-ni"
                onClick={() => handleDisposition('NI')}
              >
                Not Interested
              </button>
              <button 
                className="disp-btn disp-dnc"
                onClick={() => handleDisposition('DNC')}
              >
                Do Not Call
              </button>
              <button 
                className="disp-btn disp-cb"
                onClick={handleCallBack}
              >
                Call Back
              </button>
              <button 
                className="disp-btn disp-book"
                onClick={handleBookAppointment}
              >
                📅 Book Appointment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-leads">
          <h2>Waiting patiently for a lead to come in...</h2>
          <div className="spinner"></div>
        </div>
      )}

      {/* Call Back Modal */}
      {showCallBackModal && (
        <div className="modal-overlay" onClick={() => setShowCallBackModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Schedule Call Back</h3>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={callBackDate}
                onChange={(e) => setCallBackDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Time:</label>
              <input
                type="time"
                value={callBackTime}
                onChange={(e) => setCallBackTime(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button onClick={submitCallBack} className="btn-primary">Schedule</button>
              <button onClick={() => setShowCallBackModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Book Appointment</h3>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Time:</label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Notes (optional):</label>
              <textarea
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                rows={3}
                placeholder="Add any appointment notes..."
              />
            </div>
            <div className="modal-actions">
              <button onClick={submitBooking} className="btn-primary">Book Appointment</button>
              <button onClick={() => setShowBookingModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className="success-overlay">
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h2>Appointment Booked Successfully!</h2>
            <p>Great work!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetails;