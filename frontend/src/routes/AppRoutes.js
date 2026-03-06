import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RegisterPage from '../pages/auth/RegisterPage';
import LoginPage    from '../pages/auth/LoginPage';
import Reports from '../pages/admin/Reports';
import Profile from '../pages/shared/Profile';
// Employee
import EmployeeDashboard  from '../pages/employee/EmployeeDashboard';
import MyIncidents        from '../pages/employee/MyIncidents';
import CreateIncident     from '../pages/employee/CreateIncident';

// Engineer
import EngineerDashboard  from '../pages/engineer/EngineerDashboard';
import AssignedIncidents  from '../pages/engineer/AssignedIncidents';
import SLAMonitor         from '../pages/engineer/SLAMonitor';
import KnowledgeBase      from '../pages/engineer/KnowledgeBase';

// Admin
import AdminDashboard     from '../pages/admin/AdminDashboard';
import ManageUsers        from '../pages/admin/ManageUsers';
import ManageAssets       from '../pages/admin/ManageAssets';
import AllIncidents       from '../pages/admin/AllIncidents';

// Shared
import IncidentDetail     from '../pages/shared/IncidentDetail';

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  const defaultRedirect = () => {
    if (role === 'admin')    return '/admin/dashboard';
    if (role === 'engineer') return '/engineer/dashboard';
    if (role === 'employee') return '/employee/dashboard';
    return '/login';
  };

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Employee */}
      <Route path="/employee/dashboard"     element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/incidents"     element={<ProtectedRoute allowedRoles={['employee']}><MyIncidents /></ProtectedRoute>} />
      <Route path="/employee/incidents/new" element={<ProtectedRoute allowedRoles={['employee']}><CreateIncident /></ProtectedRoute>} />
      <Route path="/employee/incidents/:id" element={<ProtectedRoute allowedRoles={['employee']}><IncidentDetail /></ProtectedRoute>} />
      
      {/* Engineer */}
      <Route path="/engineer/dashboard"     element={<ProtectedRoute allowedRoles={['engineer']}><EngineerDashboard /></ProtectedRoute>} />
      <Route path="/engineer/incidents"     element={<ProtectedRoute allowedRoles={['engineer']}><AssignedIncidents /></ProtectedRoute>} />
      <Route path="/engineer/incidents/:id" element={<ProtectedRoute allowedRoles={['engineer']}><IncidentDetail /></ProtectedRoute>} />
      <Route path="/engineer/sla"           element={<ProtectedRoute allowedRoles={['engineer']}><SLAMonitor /></ProtectedRoute>} />
      <Route path="/engineer/knowledge"     element={<ProtectedRoute allowedRoles={['engineer']}><KnowledgeBase /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard"        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"            element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/assets"           element={<ProtectedRoute allowedRoles={['admin']}><ManageAssets /></ProtectedRoute>} />
      <Route path="/admin/incidents"        element={<ProtectedRoute allowedRoles={['admin']}><AllIncidents /></ProtectedRoute>} />
      <Route path="/admin/incidents/:id"    element={<ProtectedRoute allowedRoles={['admin']}><IncidentDetail /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute allowedRoles={['employee']}><Profile /></ProtectedRoute>} />
      <Route path="/engineer/profile" element={<ProtectedRoute allowedRoles={['engineer']}><Profile /></ProtectedRoute>} />
      <Route path="/admin/profile"    element={<ProtectedRoute allowedRoles={['admin']}><Profile /></ProtectedRoute>} />
      {/* Default */}
      <Route path="/" element={<Navigate to={isAuthenticated ? defaultRedirect() : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}