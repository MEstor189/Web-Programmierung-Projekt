import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, Users, Building2, LogIn, LogOut, UserCheck, Shield, Archive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isRecruiterOrAdmin, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--color-slate-200)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand Logo & Name */}
        <NavLink to={isRecruiterOrAdmin ? "/recruiter" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-900))',
            color: '#ffffff',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-slate-900)', display: 'block', lineHeight: 1.1 }}>
              TechCorp
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-600)', fontWeight: 500 }}>
              {isRecruiterOrAdmin ? 'Recruiter & ATS' : 'Careers & ATS'}
            </span>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {!isRecruiterOrAdmin && (
            <NavLink
              to="/"
              end
              className={({ isActive }) => isActive ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.85rem' }}
            >
              <Briefcase size={15} />
              Karriere
            </NavLink>
          )}

          {isRecruiterOrAdmin && (
            <>
              <NavLink
                to="/recruiter/jobs"
                className={({ isActive }) => isActive ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ fontSize: '0.85rem' }}
              >
                <Briefcase size={15} />
                Stellen
              </NavLink>

              <NavLink
                to="/recruiter"
                end
                className={({ isActive }) => isActive ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ fontSize: '0.85rem' }}
              >
                <Users size={15} />
                Bewerbungen
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => isActive ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ fontSize: '0.85rem' }}
              >
                <Shield size={15} />
                Benutzer
              </NavLink>

              <NavLink
                to="/admin/archive"
                className={({ isActive }) => isActive ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ fontSize: '0.85rem' }}
              >
                <Archive size={15} />
                Archiv
              </NavLink>
            </>
          )}

          {isAuthenticated && !isRecruiterOrAdmin && (
            <NavLink
              to="/applicant/dashboard"
              className={({ isActive }) => isActive ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.875rem' }}
            >
              <UserCheck size={16} />
              Meine Bewerbungen
            </NavLink>
          )}

          {/* User Auth Action */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem', borderLeft: '1px solid var(--color-slate-200)', paddingLeft: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                <UserCheck size={16} style={{ color: 'var(--color-brand-600)' }} />
                <span>{user?.first_name || user?.email}</span>
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', backgroundColor: 'var(--color-brand-50)', color: 'var(--color-brand-700)', borderRadius: '4px' }}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                title="Abmelden"
              >
                <LogOut size={14} />
                Abmelden
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => isActive ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.875rem', gap: '0.4rem' }}
            >
              <LogIn size={16} />
              Anmelden / Registrieren
            </NavLink>
          )}

        </nav>
      </div>
    </header>
  );
};
