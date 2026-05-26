import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/common/Layout.jsx';

import Login       from './pages/Login.jsx';
import Dashboard   from './pages/Dashboard.jsx';
import Employees   from './pages/Employees.jsx';
import Departments from './pages/Departments.jsx';
import Attendance  from './pages/Attendance.jsx';
import Leave       from './pages/Leave.jsx';
import Payroll     from './pages/Payroll.jsx';
import Performance from './pages/Performance.jsx';
import Reports     from './pages/Reports.jsx';
import Profile     from './pages/Profile.jsx';

function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout />}>
            <Route path="/dashboard"   element={<Guard><Dashboard /></Guard>} />
            <Route path="/employees"   element={<Guard roles={['admin','hr_manager']}><Employees /></Guard>} />
            <Route path="/departments" element={<Guard roles={['admin','hr_manager']}><Departments /></Guard>} />
            <Route path="/attendance"  element={<Guard><Attendance /></Guard>} />
            <Route path="/leave"       element={<Guard><Leave /></Guard>} />
            <Route path="/payroll"     element={<Guard><Payroll /></Guard>} />
            <Route path="/performance" element={<Guard><Performance /></Guard>} />
            <Route path="/reports"     element={<Guard roles={['admin','hr_manager']}><Reports /></Guard>} />
            <Route path="/profile"     element={<Guard><Profile /></Guard>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
