import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, Shield, Lock, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Footer: React.FC = () => {
  const { isAuthenticated, isRecruiterOrAdmin, isAdmin } = useAuth();

  return (
    <footer style={{
      background: 'var(--color-slate-900)',
      color: 'var(--color-slate-300)',
      padding: '3rem 0 2rem 0',
      marginTop: 'auto',
      borderTop: '1px solid var(--color-slate-800)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Column 1: Enterprise Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={18} />
              </div>
              <h4 style={{ color: '#ffffff', margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                TechCorp Solutions GmbH
              </h4>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-400)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Modernes IT-Bewerbermanagementportal (ATS) für transparente, faire und datenschutzkonforme Rekrutierungsprozesse.
            </p>
            <span className="badge badge-info" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe' }}>
              TechCorp Careers & ATS v1.0
            </span>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', padding: 0, margin: 0 }}>
              {isRecruiterOrAdmin ? (
                <>
                  <li>
                    <NavLink to="/recruiter" style={{ color: 'var(--color-slate-300)', textDecoration: 'none' }} className="footer-link">
                      Bewerber-Pipeline
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/recruiter/jobs" style={{ color: 'var(--color-slate-300)', textDecoration: 'none' }} className="footer-link">
                      Stellenverwaltung
                    </NavLink>
                  </li>
                  {isAdmin && (
                    <>
                      <li>
                        <NavLink to="/admin/users" style={{ color: 'var(--color-slate-300)', textDecoration: 'none' }} className="footer-link">
                          Benutzerverwaltung
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/admin/archive" style={{ color: 'var(--color-slate-300)', textDecoration: 'none' }} className="footer-link">
                          Archiv
                        </NavLink>
                      </li>
                    </>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <NavLink to="/" style={{ color: 'var(--color-slate-300)', textDecoration: 'none' }} className="footer-link">
                      Offene Stellenanzeigen
                    </NavLink>
                  </li>
                  {isAuthenticated ? (
                    <li>
                      <NavLink to="/applicant/dashboard" style={{ color: 'var(--color-slate-300)', textDecoration: 'none' }} className="footer-link">
                        Meine Bewerbungen
                      </NavLink>
                    </li>
                  ) : (
                    <li>
                      <NavLink to="/login" style={{ color: 'var(--color-slate-300)', textDecoration: 'none' }} className="footer-link">
                        Bewerber-Portal (Login)
                      </NavLink>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Legal & Privacy */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 600 }}>
              Rechtliches & Datenschutz
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', padding: 0, margin: 0 }}>
              <li>
                <NavLink to="/impressum" style={{ color: 'var(--color-slate-300)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={15} style={{ color: 'var(--color-brand-400)' }} />
                  <span>Impressum (§ 5 DDG)</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/compliance#dsgvo" style={{ color: 'var(--color-slate-300)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={15} style={{ color: 'var(--color-brand-400)' }} />
                  <span>Datenschutzhinweise & DSGVO</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/compliance#agg" style={{ color: 'var(--color-slate-300)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={15} style={{ color: 'var(--color-brand-400)' }} />
                  <span>AGG & Chancengleichheit</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--color-slate-800)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--color-slate-400)'
        }}>
          <div>
            © {new Date().getFullYear()} TechCorp Solutions GmbH. Alle Rechte vorbehalten.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <NavLink to="/impressum" style={{ color: 'var(--color-slate-400)', textDecoration: 'none' }}>Impressum</NavLink>
            <NavLink to="/compliance#dsgvo" style={{ color: 'var(--color-slate-400)', textDecoration: 'none' }}>Datenschutz</NavLink>
            <NavLink to="/compliance#agg" style={{ color: 'var(--color-slate-400)', textDecoration: 'none' }}>AGG Hinweise</NavLink>
            <NavLink to="/compliance#bfsg" style={{ color: 'var(--color-slate-400)', textDecoration: 'none' }}>Barrierefreiheit</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

