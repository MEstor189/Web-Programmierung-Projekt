import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  FileText,
  User,
  Edit3,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyApplicationsApi, withdrawApplicationApi, getApplicationDetailApi, fetchDocumentBlob } from '../services/api';
import { ApplicationEditModal } from '../components/jobs/ApplicationEditModal';
import type { Application, ApplicationDetail, ApplicationStatus } from '../types';

export const ApplicantDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Application for Detail Modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedAppDetail, setSelectedAppDetail] = useState<ApplicationDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Editing Application State
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Withdraw Confirmation State
  const [withdrawAppId, setWithdrawAppId] = useState<number | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyApplicationsApi();
      setApplications(data);
    } catch (err: any) {
      console.error('Failed to load applicant applications:', err);
      setError(err.response?.data?.detail || 'Ihre Bewerbungen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleWithdraw = async (id: number) => {
    setIsWithdrawing(true);
    setActionSuccessMsg(null);
    try {
      await withdrawApplicationApi(id);
      setActionSuccessMsg('Bewerbung wurde erfolgreich zurückgezogen.');
      setWithdrawAppId(null);
      await fetchApplications();
    } catch (err: any) {
      console.error('Failed to withdraw application:', err);
      alert(err.response?.data?.detail || 'Fehler beim Zurückziehen der Bewerbung.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unbekannt';
    const d = new Date(dateString);
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const config: Record<ApplicationStatus, { label: string; bg: string; color: string; border: string; desc: string }> = {
      RECEIVED: {
        label: 'Eingegangen',
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#bfdbfe',
        desc: 'Ihre Bewerbung liegt der HR-Abteilung vor.'
      },
      SCREENING: {
        label: 'In Prüfung',
        bg: '#fefce8',
        color: '#a16207',
        border: '#fef08a',
        desc: 'Ihre Unterlagen werden im Fachbereich ausgewertet.'
      },
      INTERVIEW: {
        label: 'Interview',
        bg: '#f3e8ff',
        color: '#6b21a8',
        border: '#e9d5ff',
        desc: 'Sie wurden zu einem Vorstellungsgespräch eingeladen.'
      },
      OFFER: {
        label: 'Vertragsangebot',
        bg: '#f0fdf4',
        color: '#15803d',
        border: '#bbf7d0',
        desc: 'Wir haben Ihnen ein Vertragsangebot zugesandt.'
      },
      HIRED: {
        label: 'Eingestellt',
        bg: '#ecfdf5',
        color: '#047857',
        border: '#a7f3d0',
        desc: 'Herzlichen Glückwunsch! Sie wurden eingestellt.'
      },
      REJECTED: {
        label: 'Absage',
        bg: '#fef2f2',
        color: '#b91c1c',
        border: '#fecaca',
        desc: 'Leider konnten wir Ihre Bewerbung nicht berücksichtigen.'
      },
      WITHDRAWN: {
        label: 'Zurückgezogen',
        bg: '#f1f5f9',
        color: '#475569',
        border: '#cbd5e1',
        desc: 'Bewerbung wurde von Ihnen zurückgezogen.'
      }
    };

    const c = config[status] || {
      label: status,
      bg: '#f1f5f9',
      color: '#475569',
      border: '#cbd5e1',
      desc: ''
    };

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.3rem 0.65rem',
          borderRadius: '20px',
          backgroundColor: c.bg,
          color: c.color,
          border: `1px solid ${c.border}`,
          fontSize: '0.8rem',
          fontWeight: 600
        }}
        title={c.desc}
      >
        {c.label}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="card" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
          <User size={48} style={{ color: 'var(--color-brand-600)', marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-slate-900)', marginBottom: '0.75rem' }}>
            Bewerber-Portal Anmelden
          </h2>
          <p style={{ color: 'var(--color-slate-600)', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Bitte melden Sie sich an oder erstellen Sie ein Bewerberkonto, um den Status Ihrer eingereichten Bewerbungen einzusehen.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <NavLink to="/login" className="btn btn-primary">
              Jetzt Anmelden / Registrieren
            </NavLink>
            <NavLink to="/" className="btn btn-secondary">
              Zur Karriereseite
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-slate-50)', minHeight: 'calc(100vh - 140px)', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-slate-900), #1e293b)',
        color: '#ffffff',
        padding: '3rem 0 2.5rem 0',
        marginBottom: '2.5rem'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#ffffff' }}>
                Willkommen zurück, {user?.first_name || user?.email}!
              </h1>
            </div>

            <NavLink to="/" className="btn btn-secondary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <Briefcase size={16} /> Weitere Stellen durchsuchen
            </NavLink>
          </div>
        </div>
      </div>

      <div className="container">
        {actionSuccessMsg && (
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 500
          }}>
            <CheckCircle2 size={20} />
            {actionSuccessMsg}
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Eingereichte Bewerbungen
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-slate-900)', marginTop: '0.25rem' }}>
              {applications.length}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Aktive Verfahren
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand-600)', marginTop: '0.25rem' }}>
              {applications.filter(a => ['RECEIVED', 'SCREENING', 'INTERVIEW', 'OFFER'].includes(a.status)).length}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              DSGVO-Compliance
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#16a34a', fontWeight: 600, fontSize: '0.95rem' }}>
              <ShieldCheck size={20} />
              § 26 BDSG / 180 Tage
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
            <p style={{ color: 'var(--color-slate-600)' }}>Lade Bewerbungen...</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger)' }}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <Briefcase size={48} style={{ color: 'var(--color-slate-300)', marginBottom: '1.25rem' }} />
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-slate-800)', marginBottom: '0.5rem' }}>
              Noch keine Bewerbungen vorhanden
            </h3>
            <p style={{ color: 'var(--color-slate-600)', maxWidth: '450px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
              Sie haben bisher noch keine Stellenbewerbung über das Portal eingereicht. Entdecken Sie jetzt unsere aktuellen Stellenangebote!
            </p>
            <NavLink to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={16} /> Karriereseite entdecken
            </NavLink>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {applications.map((app) => (
              <div
                key={app.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  transition: 'box-shadow 0.15s ease'
                }}
              >
                {/* Left Info Column */}
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {getStatusBadge(app.status)}
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={13} /> Eingereicht am {formatDate(app.created_at)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: '0 0 0.35rem 0' }}>
                    {app.job_posting_title || app.job_posting?.title || `Bewerbung #${app.id}`}
                  </h3>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-slate-600)', flexWrap: 'wrap' }}>
                    {app.job_posting?.department && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Building2 size={14} style={{ color: 'var(--color-brand-600)' }} />
                        {app.job_posting.department.name}
                      </span>
                    )}
                    {app.job_posting?.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} style={{ color: 'var(--color-slate-400)' }} />
                        {app.job_posting.location}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-slate-500)' }}>
                      <ShieldCheck size={14} style={{ color: '#16a34a' }} />
                      Löschfrist: {formatDate(app.retention_until)}
                    </span>
                  </div>
                </div>

                {/* Right Action Column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={async () => {
                      setSelectedApp(app);
                      setSelectedAppDetail(null);
                      setIsDetailModalOpen(true);
                      setIsLoadingDetail(true);
                      try {
                        const detail = await getApplicationDetailApi(app.id);
                        setSelectedAppDetail(detail);
                      } catch (err) {
                        console.error('Failed to load detail:', err);
                      } finally {
                        setIsLoadingDetail(false);
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem', gap: '0.35rem' }}
                  >
                    <FileText size={15} />
                    Details
                  </button>

                  {['RECEIVED', 'SCREENING', 'INTERVIEW', 'OFFER'].includes(app.status) && (
                    <button
                      onClick={() => {
                        setEditingApp(app);
                        setIsEditModalOpen(true);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem', gap: '0.35rem' }}
                    >
                      <Edit3 size={15} />
                      Bearbeiten & Dokumente
                    </button>
                  )}

                  {['RECEIVED', 'SCREENING', 'INTERVIEW', 'OFFER'].includes(app.status) && (
                    <button
                      onClick={() => setWithdrawAppId(app.id)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem', color: 'var(--color-danger)', borderColor: '#fecaca' }}
                    >
                      Zurückziehen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Application Details Modal */}
        {isDetailModalOpen && selectedApp && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div className="card" style={{ maxWidth: '640px', width: '100%', padding: '1.75rem', maxHeight: '88vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-slate-900)' }}>
                  Bewerbungsdetails #{selectedApp.id}
                </h3>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-slate-500)' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--color-slate-500)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase' }}>Stelle</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-slate-900)' }}>{selectedApp.job_posting_title || selectedApp.job_posting?.title || 'k.A.'}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-slate-500)', display: 'block', fontSize: '0.78rem' }}>Name</span>
                    <span>{selectedApp.first_name} {selectedApp.last_name}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-slate-500)', display: 'block', fontSize: '0.78rem' }}>E-Mail</span>
                    <span>{selectedApp.email}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-slate-500)', display: 'block', fontSize: '0.78rem' }}>Gehaltswunsch</span>
                    <span>{selectedApp.expected_salary ? `${selectedApp.expected_salary.toLocaleString('de-DE')} €/Jahr` : 'Keine Angabe'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-slate-500)', display: 'block', fontSize: '0.78rem' }}>Kündigungsfrist</span>
                    <span>{selectedApp.notice_period || 'Keine Angabe'}</span>
                  </div>
                </div>

                {selectedApp.cover_letter_text && (
                  <div>
                    <span style={{ color: 'var(--color-slate-500)', display: 'block', fontSize: '0.78rem', marginBottom: '0.25rem' }}>Anschreiben / Notiz</span>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', whiteSpace: 'pre-line' }}>
                      {selectedApp.cover_letter_text}
                    </div>
                  </div>
                )}

                {/* Uploaded Documents List in Details */}
                <div>
                  <span style={{ color: 'var(--color-slate-500)', display: 'block', fontSize: '0.78rem', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Hochgeladene Unterlagen ({selectedAppDetail?.documents?.length || 0})
                  </span>

                  {isLoadingDetail ? (
                    <div style={{ padding: '0.75rem', color: 'var(--color-slate-500)', fontSize: '0.8rem' }}>
                      Dokumente werden geladen...
                    </div>
                  ) : (selectedAppDetail?.documents && selectedAppDetail.documents.length > 0) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {selectedAppDetail.documents.map((doc) => {
                        const isImg = doc.mime_type?.startsWith('image/') || doc.original_filename?.match(/\.(png|jpg|jpeg|webp|gif)$/i);
                        return (
                          <div
                            key={doc.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: '#f8fafc',
                              border: '1px solid var(--color-slate-200)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.825rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                              {isImg ? (
                                <ImageIcon size={16} style={{ color: '#0284c7', flexShrink: 0 }} />
                              ) : (
                                <FileText size={16} style={{ color: 'var(--color-brand-600)', flexShrink: 0 }} />
                              )}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                {doc.original_filename}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const blob = await fetchDocumentBlob(selectedApp.id, doc.id);
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = doc.original_filename || 'Dokument';
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                } catch (e) {
                                  window.open(`/api/v1/applications/${selectedApp.id}/documents/${doc.id}`, '_blank');
                                }
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', gap: '0.25rem' }}
                            >
                              <Download size={12} />
                              Download
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '0.5rem', color: 'var(--color-slate-500)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      Keine gesonderten Dokumente gefunden.
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#166534', fontSize: '0.8rem' }}>
                  <ShieldCheck size={16} style={{ display: 'inline', marginRight: '0.35rem' }} />
                  DSGVO-Einwilligung erteilt am {formatDate(selectedApp.dsgvo_consent_at)}. Automatische Anonymisierung/Löschung am {formatDate(selectedApp.retention_until)}.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                {['RECEIVED', 'SCREENING', 'INTERVIEW', 'OFFER'].includes(selectedApp.status) && (
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setEditingApp(selectedApp);
                      setIsEditModalOpen(true);
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Unterlagen / Angaben bearbeiten
                  </button>
                )}
                <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-secondary">
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Confirmation Modal */}
        {withdrawAppId && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem 1.75rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <AlertCircle size={32} style={{ color: '#dc2626' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
                Bewerbung wirklich zurückziehen?
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
                Möchten Sie diese Bewerbung verbindlich aus dem Auswahlverfahren zurückziehen? Das Recruiting-Team wird über den Rückzug informiert.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setWithdrawAppId(null)}
                  className="btn btn-secondary"
                  disabled={isWithdrawing}
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={() => handleWithdraw(withdrawAppId)}
                  className="btn btn-danger"
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? 'Wird zurückgezogen...' : 'Bewerbung verbindlich zurückziehen'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Application Edit Modal */}
        <ApplicationEditModal
          application={editingApp}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingApp(null);
          }}
          onSaved={() => {
            setActionSuccessMsg('Ihre Bewerbung wurde erfolgreich aktualisiert.');
            fetchApplications();
          }}
        />

      </div>
    </div>
  );
};
