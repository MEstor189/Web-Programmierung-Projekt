import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CompliancePage } from './pages/CompliancePage';
import { RecruiterDashboardPage } from './pages/RecruiterDashboardPage';
import { JobsManagementPage } from './pages/JobsManagementPage';
import { LoginPage } from './pages/LoginPage';

import { JobDetailPage } from './pages/JobDetailPage';
import { ApplicantDashboardPage } from './pages/ApplicantDashboardPage';
import { ImpressumPage } from './pages/ImpressumPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminArchivePage } from './pages/AdminArchivePage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs/:idOrSlug" element={<JobDetailPage />} />
              <Route
                path="/applicant/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <ApplicantDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/recruiter/jobs"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                    <JobsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                    <RecruiterDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/archive"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminArchivePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/impressum" element={<ImpressumPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
