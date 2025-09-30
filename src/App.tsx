// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LeadDetails from './pages/LeadDetails';
import DataSource from './pages/DataSource';
import UserManagement from './pages/UserManagement';
import LeadQueue from './pages/LeadQueue';
import Disposition from './pages/Disposition';
import Availability from './pages/Availability';
import Appointments from './pages/Appointments';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<EmployeeDashboard />} />

        {/* Leads */}
        <Route path="/leads" element={<LeadDetails />} />
        <Route path="/lead-queue" element={<LeadQueue />} />
        <Route path="/disposition" element={<Disposition />} />

        {/* Data Source */}
        <Route path="/data-source" element={<DataSource />} />

        {/* Users */}
        <Route path="/users" element={<UserManagement />} />

        {/* Availability */}
        <Route path="/availability" element={<Availability />} />

        {/* Appointments */}
        <Route path="/appointments" element={<Appointments />} />
      </Routes>
    </div>
  );
};

export default App;
