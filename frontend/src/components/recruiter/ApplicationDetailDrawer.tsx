import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  DollarSign,
  Clock,
  ShieldCheck,
  FileText,
  Download,
  AlertCircle,
  Building2,
  Briefcase,
  History,
  MessageSquare
} from 'lucide-react';
import type { ApplicationDetail, ApplicationStatus } from '../../types';
import { getApplicationDetailApi, updateApplicationStatusApi, fetchDocumentBlob } from '../../services/api';
import { NotesSection } from './NotesSection';

interface ApplicationDetailDrawerProps {
  applicationId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationUpdated: () => void;
}

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  applicationId,
  isOpen,
  onClose,
  onApplicationUpdated,
}) => {
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dossier' | 'notes' | 'history'>('dossier');

  // Status Change state
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [statusReason, setStatusReason] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // PDF Document Blob preview state
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && applicationId) {
      loadDetail(applicationId);
    } else {
      setDetail(null);
      setError(null);
      setDocumentBlobUrl(null);
    }
  }, [isOpen, applicationId]);

  const cvDocument = detail?.documents?.find((doc) => doc.file_type === 'CV') || detail?.documents?.[0];

  useEffect(() => {
    let activeUrl: string | null = null;
    if (detail && cvDocument && !cvDocument.is_deleted) {
      setLoadingDoc(true);
      setDocError(null);
      fetchDocumentBlob(detail.id, cvDocument.id)
        .then((blob) => {
          activeUrl = URL.createObjectURL(blob);
          setDocumentBlobUrl(activeUrl);
        })
        .catch((err) => {
          console.error('Fehler beim Laden des Lebenslaufs:', err);
          setDocError('Das Dokument konnte nicht über die gesicherte Schnittstelle geladen werden.');
        })
        .finally(() => {
          setLoadingDoc(false);
        });
    } else {
      setDocumentBlobUrl(null);
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [detail?.id, cvDocument?.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadDetail = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplicationDetailApi(id);
      setDetail(data);
      setNewStatus(data.status);
    } catch (err: any) {
      console.error('Fehler beim Laden der Bewerbungsdetails:', err);
      setError(err.response?.data?.detail || 'Bewerbungsakte konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!detail || !newStatus || newStatus === detail.status) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await updateApplicationStatusApi(detail.id, newStatus, statusReason.trim() || undefined);
      setDetail(updated);
      setStatusReason('');
      onApplicationUpdated();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Status konnte nicht aktualisiert werden.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'RECEIVED':
        return <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>🔵 Eingegangen</span>;
      case 'SCREENING':
        return <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>🟡 In Prüfung</span>;
      case 'INTERVIEW':
        return <span className="badge" style={{ background: '#f3e8ff', color: '#6d28d9' }}>🟣 Interview</span>;
      case 'OFFER':
        return <span className="badge" style={{ background: '#ecfdf5', color: '#047857' }}>🟢 Angebot</span>;
      case 'HIRED':
        return <span className="badge" style={{ background: '#dcfce7', color: '#15803d' }}>🎉 Eingestellt</span>;
      case 'REJECTED':
        return <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>🔴 Abgesagt</span>;
      case 'WITHDRAWN':
        return <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>⚪ Zurückgezogen</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'all 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '100%',
          background: 'var(--color-bg-primary, #ffffff)',
          boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--color-slate-200, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-slate-50, #f8fafc)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--color-slate-900)' }}>
                  {detail ? `${detail.first_name} ${detail.last_name}` : 'Kandidaten-Akte'}
                </h2>
                {detail && getStatusBadge(detail.status)}
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-slate-600)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Briefcase size={15} style={{ color: 'var(--color-brand-600)' }} />
                <strong>{detail?.job_posting_title || detail?.job_posting?.title || 'Stellenbewerbung'}</strong>
                {detail?.job_posting?.department && (
                  <>
                    <span>•</span>
                    <Building2 size={14} />
                    {detail.job_posting.department.name}
                  </>
                )}
                <span>•</span>
                <span style={{ color: 'var(--color-slate-400)' }}>Ref: #{detail?.id}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-slate-400)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Schließen (ESC)"
          >
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ color: 'var(--color-slate-500)', fontSize: '0.95rem' }}>Lade Bewerbungsdossier...</p>
            </div>
          </div>
        ) : error || !detail ? (
          <div style={{ flex: 1, padding: '2rem', textAlign: 'center' }}>
            <AlertCircle size={40} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Fehler beim Laden</h3>
            <p style={{ color: 'var(--color-slate-600)', marginBottom: '1.5rem' }}>{error || 'Bewerbung nicht gefunden.'}</p>
            <button className="btn btn-secondary" onClick={() => applicationId && loadDetail(applicationId)}>
              Erneut versuchen
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Quick Contact & Action Bar */}
            <div
              style={{
                padding: '0.85rem 1.75rem',
                background: '#ffffff',
                borderBottom: '1px solid var(--color-slate-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              {/* Quick Contact Links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <a
                  href={`mailto:${detail.email}?subject=Bewerbung%20als%20${encodeURIComponent(detail.job_posting_title || detail.job_posting?.title || 'Position')}%20bei%20TechCorp`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Mail size={14} style={{ color: 'var(--color-brand-600)' }} />
                  {detail.email}
                </a>

                {detail.phone && (
                  <a
                    href={`tel:${detail.phone}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Phone size={14} style={{ color: 'var(--color-success)' }} />
                    {detail.phone}
                  </a>
                )}

                {detail.github_url && (
                  <a
                    href={detail.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ExternalLink size={13} />
                    GitHub
                  </a>
                )}

                {detail.linkedin_url && (
                  <a
                    href={detail.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ExternalLink size={13} />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Prominent Pipeline Status Switcher Bar (Mangel Z. 36) */}
            <div
              style={{
                padding: '0.85rem 1.75rem',
                background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                borderBottom: '1px solid var(--color-slate-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 320px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pipeline-Status:
                </span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--color-brand-500)',
                    background: '#ffffff',
                    color: 'var(--color-slate-800)',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.1)'
                  }}
                >
                  <option value="RECEIVED" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>Eingegangen (Neu)</option>
                  <option value="SCREENING" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 600 }}>In Prüfung (Screening)</option>
                  <option value="INTERVIEW" style={{ backgroundColor: '#f3e8ff', color: '#6d28d9', fontWeight: 600 }}>Interview-Phase</option>
                  <option value="OFFER" style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 600 }}>Angebot unterbreitet</option>
                  <option value="HIRED" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}>Eingestellt</option>
                  <option value="REJECTED" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 600 }}>Absage erteilt</option>
                  <option value="WITHDRAWN" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>Zurückgezogen</option>
                </select>
              </div>

              {newStatus !== detail.status && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '2 1 360px', justifyContent: 'flex-end' }}>
                  <input
                    type="text"
                    placeholder="Begründung zum Statuswechsel (optional)..."
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-slate-300)',
                      flex: 1,
                      maxWidth: '300px'
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleStatusChange}
                    disabled={isUpdatingStatus}
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.45rem 1rem',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
                    }}
                  >
                    {isUpdatingStatus ? 'Wird gespeichert...' : 'Status verbindlich ändern'}
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--color-slate-200)',
                padding: '0 1.75rem',
                background: 'var(--color-slate-50)',
                gap: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('dossier')}
                style={{
                  padding: '0.85rem 0.25rem',
                  border: 'none',
                  borderBottom: activeTab === 'dossier' ? '2px solid var(--color-brand-600)' : '2px solid transparent',
                  background: 'none',
                  color: activeTab === 'dossier' ? 'var(--color-brand-600)' : 'var(--color-slate-600)',
                  fontWeight: activeTab === 'dossier' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <FileText size={16} />
                Bewerber-Dossier & CV
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                style={{
                  padding: '0.85rem 0.25rem',
                  border: 'none',
                  borderBottom: activeTab === 'notes' ? '2px solid var(--color-brand-600)' : '2px solid transparent',
                  background: 'none',
                  color: activeTab === 'notes' ? 'var(--color-brand-600)' : 'var(--color-slate-600)',
                  fontWeight: activeTab === 'notes' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <MessageSquare size={16} />
                Team-Notizen & AGG ({detail.notes?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '0.85rem 0.25rem',
                  border: 'none',
                  borderBottom: activeTab === 'history' ? '2px solid var(--color-brand-600)' : '2px solid transparent',
                  background: 'none',
                  color: activeTab === 'history' ? 'var(--color-brand-600)' : 'var(--color-slate-600)',
                  fontWeight: activeTab === 'history' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <History size={16} />
                Audit-Trail ({detail.status_history?.length || 0})
              </button>
            </div>

            {/* Tab Content Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
              {activeTab === 'dossier' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Key Stats Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div className="card" style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <DollarSign size={14} /> Gehaltsvorstellung
                      </span>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.3rem 0 0 0', color: 'var(--color-slate-800)' }}>
                        {detail.expected_salary
                          ? `${Number(detail.expected_salary).toLocaleString('de-DE')} € / Jahr`
                          : 'Keine Angabe'}
                      </p>
                    </div>

                    <div className="card" style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} /> Frühestes Eintrittsdatum
                      </span>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.3rem 0 0 0', color: 'var(--color-slate-800)' }}>
                        {detail.earliest_starting_date
                          ? new Date(detail.earliest_starting_date).toLocaleDateString('de-DE')
                          : 'Sofort / Nach Absprache'}
                      </p>
                    </div>

                    <div className="card" style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} /> Kündigungsfrist
                      </span>
                      <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.3rem 0 0 0', color: 'var(--color-slate-800)' }}>
                        {detail.notice_period || 'Keine Angabe'}
                      </p>
                    </div>

                    <div className="card" style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={14} /> DSGVO-Löschfrist
                      </span>
                      <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0.3rem 0 0 0', color: 'var(--color-brand-600)' }}>
                        {detail.retention_until
                          ? new Date(detail.retention_until).toLocaleDateString('de-DE')
                          : '6 Monate ab Abschluss'}
                      </p>
                    </div>
                  </div>

                  {/* Cover Letter Section if present */}
                  {detail.cover_letter_text && (
                    <div className="card" style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-slate-800)' }}>
                        Motivationsschreiben / Freitext
                      </h4>
                      <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                        {detail.cover_letter_text}
                      </p>
                    </div>
                  )}

                  {/* Document & PDF Viewer */}
                  <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--color-slate-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} style={{ color: 'var(--color-brand-600)' }} />
                        Hochgeladener Lebenslauf & Dokumente
                      </h4>

                      {cvDocument && documentBlobUrl && (
                        <a
                          href={documentBlobUrl}
                          download={cvDocument.original_filename || 'Lebenslauf.pdf'}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <Download size={14} />
                          PDF herunterladen ({cvDocument.original_filename})
                        </a>
                      )}
                    </div>

                    {cvDocument ? (
                      <div>
                        {loadingDoc ? (
                          <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
                            <div className="spinner" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem' }}>Lade gesichertes PDF-Dokument...</p>
                          </div>
                        ) : docError ? (
                          <div style={{ padding: '2rem', textAlign: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#991b1b' }}>
                            <AlertCircle size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                            <p style={{ margin: 0, fontWeight: 600 }}>{docError}</p>
                          </div>
                        ) : documentBlobUrl ? (
                          <div
                            style={{
                              height: '540px',
                              border: '1px solid var(--color-slate-200)',
                              borderRadius: 'var(--radius-md)',
                              overflow: 'hidden',
                              background: 'var(--color-slate-100)',
                            }}
                          >
                            <iframe
                              src={documentBlobUrl}
                              title="Lebenslauf Vorschau"
                              width="100%"
                              height="100%"
                              style={{ border: 'none' }}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '3rem 1rem',
                          background: 'var(--color-slate-50)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px dashed var(--color-slate-200)',
                          color: 'var(--color-slate-500)',
                        }}
                      >
                        Kein Lebenslauf-Dokument hinterlegt.
                      </div>
                    )}
                  </div>

                  {/* DSGVO & Privacy Compliance Box */}
                  <div
                    style={{
                      background: 'var(--color-slate-50)',
                      border: '1px solid var(--color-slate-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <ShieldCheck size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-600)' }}>
                      <strong>Datenschutz-Einwilligung:</strong> Erteilt am{' '}
                      {detail.dsgvo_consent_at
                        ? new Date(detail.dsgvo_consent_at).toLocaleString('de-DE')
                        : new Date(detail.created_at).toLocaleString('de-DE')}
                      . Die Daten werden gemäß DSGVO § 26 BDSG nach Abschluss des Verfahrens automatisch zur Löschung vorgemerkt.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <NotesSection
                  applicationId={detail.id}
                  notes={detail.notes || []}
                  onNotesChanged={() => loadDetail(detail.id)}
                />
              )}

              {activeTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: 'var(--color-slate-800)' }}>
                    Chronologischer Audit-Trail & Statuswechsel
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--color-slate-500)', margin: 0 }}>
                    Rechtssicherer Nachweis aller Verfahrensschritte und Phasenwechsel im Bewerbungsprozess.
                  </p>

                  {(!detail.status_history || detail.status_history.length === 0) ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '2.5rem 1rem',
                        background: 'var(--color-slate-50)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-slate-500)',
                        fontSize: '0.88rem',
                      }}
                    >
                      Bisher keine Statuswechsel dokumentiert.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                      {detail.status_history.map((hist) => (
                        <div
                          key={hist.id}
                          style={{
                            padding: '1rem 1.25rem',
                            border: '1px solid var(--color-slate-200)',
                            borderRadius: 'var(--radius-md)',
                            background: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              {getStatusBadge(hist.old_status)}
                              <span style={{ color: 'var(--color-slate-400)' }}>➔</span>
                              {getStatusBadge(hist.new_status)}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} />
                              {new Date(hist.created_at).toLocaleString('de-DE')}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.84rem', color: 'var(--color-slate-600)', marginTop: '0.25rem' }}>
                            Bearbeiter: <strong>{hist.changed_by_user_name || 'System / Recruiter'}</strong>
                            {hist.reason && (
                              <div style={{ marginTop: '0.25rem', fontStyle: 'italic', color: 'var(--color-slate-700)' }}>
                                Begründung: „{hist.reason}“
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
