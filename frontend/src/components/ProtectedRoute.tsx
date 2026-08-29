import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        backgroundColor: 'var(--color-slate-50)'
      }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
        <p style={{ color: 'var(--color-slate-500)', fontSize: '0.9rem', fontWeight: 500 }}>
          Sitzung wird überprüft...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // If authenticated user lacks required role, redirect to appropriate home
    if (user.role === 'CANDIDATE') {
      return <Navigate to="/applicant/dashboard" replace />;
    }
    return <Navigate to="/recruiter" replace />;
  }

  return children ? <>{children}</> : null;
};
