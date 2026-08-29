import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Building2,
  AlertCircle,
  LogIn,
  UserPlus,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginApi, registerCandidateApi } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirectTarget = searchParams.get('redirect');

  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setActiveTab('login');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'login') {
      if (!email.trim() || !password) {
        setError('Bitte geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.');
        return;
      }
      performLogin(email.trim(), password);
    } else {
      // Candidate Registration
      if (!email.trim() || !password || !firstName.trim() || !lastName.trim()) {
        setError('Bitte füllen Sie alle erforderlichen Pflichtfelder aus.');
        return;
      }
      if (password.length < 6) {
        setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
        return;
      }

      setLoading(true);
      try {
        await registerCandidateApi({
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim()
        });

        // Automatically log in after registration
        const { access_token } = await loginApi(email.trim(), password);
        await login(access_token);

        if (redirectTarget) {
          navigate(decodeURIComponent(redirectTarget));
        } else {
          navigate('/applicant/dashboard');
        }
      } catch (err: any) {
        console.error('Registration failed:', err);
        setError(err.response?.data?.detail || 'Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
      } finally {
        setLoading(false);
      }
    }
  };

  const performLogin = async (userEmail: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const { access_token } = await loginApi(userEmail, pass);
      const userData = await login(access_token);

      if (redirectTarget) {
        navigate(decodeURIComponent(redirectTarget));
      } else if (userData?.role === 'RECRUITER' || userData?.role === 'ADMIN' || userEmail.toLowerCase().includes('techcorp.de')) {
        navigate('/recruiter');
      } else {
        navigate('/applicant/dashboard');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre E-Mail-Adresse und Ihr Passwort.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.25rem',
      backgroundColor: '#0f172a',
      backgroundImage: `
        radial-gradient(at 15% 20%, rgba(37, 99, 235, 0.25) 0px, transparent 50%),
        radial-gradient(at 85% 80%, rgba(99, 102, 241, 0.20) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(15, 23, 42, 1) 0px, rgba(15, 23, 42, 1) 100%)
      `,
      backgroundAttachment: 'fixed'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          right: '-20px',
          bottom: '-20px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(168, 85, 247, 0.15))',
          borderRadius: '28px',
          filter: 'blur(20px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Main Form Card */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          padding: '2.5rem',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-900))',
              color: '#ffffff',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.15rem auto',
              boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)'
            }}>
              <Building2 size={30} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              TechCorp Portal Access
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', margin: 0, lineHeight: 1.5 }}>
              {activeTab === 'login'
                ? 'Melden Sie sich an, um Ihre Bewerbungen oder Stellen zu verwalten.'
                : 'Erstellen Sie Ihr persönliches Bewerberkonto für schnelles Bewerben.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#f1f5f9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '1.75rem',
            border: '1px solid var(--color-slate-200)'
          }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              style={{
                padding: '0.65rem 0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'login' ? '#ffffff' : 'transparent',
                color: activeTab === 'login' ? 'var(--color-brand-600)' : 'var(--color-slate-600)',
                boxShadow: activeTab === 'login' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <LogIn size={16} /> Anmelden
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError(null);
              }}
              style={{
                padding: '0.65rem 0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'register' ? '#ffffff' : 'transparent',
                color: activeTab === 'register' ? 'var(--color-brand-600)' : 'var(--color-slate-600)',
                boxShadow: activeTab === 'register' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <UserPlus size={16} /> Registrieren
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div role="alert" style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '10px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              animation: 'fadeIn 0.2s ease-in-out'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeTab === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Vorname *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Anna"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Nachname *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Schmidt"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                E-Mail-Adresse *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  placeholder={activeTab === 'login' ? 'ihre.email@example.de' : 'anna.schmidt@example.de'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                  Passwort *
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              {activeTab === 'login' ? (
                <>
                  <LogIn size={18} />
                  {loading ? 'Anmelden...' : 'Jetzt Anmelden'}
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  {loading ? 'Konto wird erstellt...' : 'Konto Registrieren'}
                </>
              )}
            </button>
          </form>

          {/* Discreet Info Box for Prüfer / Dozenten (Replaced Demo Buttons) */}
          <div style={{
            marginTop: '2.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-slate-200)'
          }}>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.15rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-slate-700)',
                marginBottom: '0.65rem'
              }}>
                <KeyRound size={15} style={{ color: 'var(--color-brand-600)' }} />
                <span>Demo-Zugangsdaten für Prüfer & Evaluierung:</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  padding: '0.4rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--color-slate-800)', marginRight: '0.4rem' }}>Recruiter:</span>
                    <code style={{ color: 'var(--color-brand-700)', background: '#eff6ff', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>recruiter@techcorp.de</code>
                    <span style={{ margin: '0 0.35rem', color: '#cbd5e1' }}>|</span>
                    <code style={{ color: 'var(--color-slate-600)' }}>recruiter123</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('recruiter@techcorp.de', 'recruiter123')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-brand-600)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px'
                    }}
                    title="In Formular einsetzen"
                  >
                    Einsetzen
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  padding: '0.4rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--color-slate-800)', marginRight: '0.4rem' }}>Admin:</span>
                    <code style={{ color: 'var(--color-brand-700)', background: '#eff6ff', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>admin@techcorp.de</code>
                    <span style={{ margin: '0 0.35rem', color: '#cbd5e1' }}>|</span>
                    <code style={{ color: 'var(--color-slate-600)' }}>admin123</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('admin@techcorp.de', 'admin123')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-brand-600)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px'
                    }}
                    title="In Formular einsetzen"
                  >
                    Einsetzen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s ease'
            }}
          >
            ← Zurück zur Karriereseite
          </Link>
        </div>
      </div>
    </div>
  );
};
