import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LeadDetails from './pages/LeadDetails';
import DataSource from './pages/DataSource';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/leads" element={<LeadDetails />} />
        <Route path="/data-source" element={<DataSource />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;