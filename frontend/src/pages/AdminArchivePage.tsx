import React, { useState, useEffect } from 'react';
import {
  Archive,
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Play
} from 'lucide-react';
import type { Application, ApplicationStatus } from '../types';
import { getApplicationsApi, runCleanupJobApi, anonymizeApplicationApi } from '../services/api';
import { ApplicationDetailDrawer } from '../components/recruiter/ApplicationDetailDrawer';

export const AdminArchivePage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [anonymizedOnly, setAnonymizedOnly] = useState<boolean>(false);

  // Drawer modal state
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Cleanup job state
  const [isRunningCleanup, setIsRunningCleanup] = useState<boolean>(false);

  const fetchArchiveData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplicationsApi({ page_size: 300 });
      setApplications(data.items);
    } catch (err: any) {
      console.error('Fehler beim Laden des Archivs:', err);
      setError(err.response?.data?.detail || 'Bewerbungsarchiv konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiveData();
  }, []);

  const handleRunCleanup = async () => {
    setIsRunningCleanup(true);
    setError(null);
    try {
      const result = await runCleanupJobApi();
      setSuccessMsg(result.message || `DSGVO-Cleanup erfolgreich: ${result.anonymized_count} Bewerbungen anonymisiert.`);
      fetchArchiveData();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Fehler beim Ausführen des Cleanup-Jobs.');
    } finally {
      setIsRunningCleanup(false);
    }
  };

  const handleManualAnonymize = async (id: number) => {
    if (!window.confirm('Möchten Sie diese Bewerbung sofort DSGVO-konform anonymisieren? Persönliche Daten werden unwiderruflich gelöscht.')) {
      return;
    }
    try {
      await anonymizeApplicationApi(id);
      setSuccessMsg(`Bewerbung #${id} wurde erfolgreich anonymisiert.`);
      fetchArchiveData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Anonymisierung fehlgeschlagen.');
    }
  };

  // KPIs
  const totalApps = applications.length;
  const anonymizedApps = applications.filter((a) => a.is_anonymized).length;
  const rejectedOrWithdrawn = applications.filter((a) => a.status === 'REJECTED' || a.status === 'WITHDRAWN').length;
  const hiredApps = applications.filter((a) => a.status === 'HIRED').length;

  // Filter logic
  const filteredApps = applications.filter((app) => {
    if (anonymizedOnly && !app.is_anonymized) return false;
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;

    const query = searchTerm.toLowerCase();
    const candidateName = `${app.first_name || ''} ${app.last_name || ''} ${app.email || ''}`.toLowerCase();
    const jobTitle = (app.job_posting_title || app.job_posting?.title || '').toLowerCase();
    return candidateName.includes(query) || jobTitle.includes(query);
  });

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
    <div style={{ backgroundColor: 'var(--color-slate-50)', minHeight: 'calc(100vh - 140px)', padding: '2rem 0' }}>
      <div style={{ width: '100%', maxWidth: '1540px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div style={{
                background: 'var(--color-brand-50)',
                color: 'var(--color-brand-600)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <Archive size={22} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.85rem', color: 'var(--color-slate-900)' }}>
                Bewerbungsarchiv & DSGVO-Audit
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>
              Lückenlose Einsicht in alle historischen Bewerbungen, DSGVO-Fristen und automatische Löschprotokolle (§ 26 BDSG)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchArchiveData}
              disabled={loading}
              className="btn btn-secondary"
              style={{ gap: '0.45rem', fontSize: '0.88rem' }}
            >
              <RefreshCw size={15} className={loading ? 'spinner' : ''} />
              Aktualisieren
            </button>

            <button
              onClick={handleRunCleanup}
              disabled={isRunningCleanup}
              className="btn btn-primary"
              style={{ gap: '0.5rem', fontSize: '0.88rem', background: '#1e1b4b', borderColor: '#1e1b4b' }}
              title="Prüft alle Bewerbungen auf abgelaufene 180-Tage-Fristen und führt DSGVO-konforme Anonymisierung durch"
            >
              <Play size={15} />
              {isRunningCleanup ? 'Cleanup läuft...' : 'DSGVO-Cleanup Job ausführen'}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
              Gesamt Historie
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-slate-900)', marginTop: '0.25rem' }}>
              {totalApps}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderLeft: '4px solid #16a34a' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>
              DSGVO-Anonymisiert
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#166534', marginTop: '0.25rem' }}>
              {anonymizedApps}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderLeft: '4px solid #dc2626' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b91c1c' }}>
              Abgesagt / Zurückgezogen
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#991b1b', marginTop: '0.25rem' }}>
              {rejectedOrWithdrawn}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8' }}>
              Erfolgreich Eingestellt
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e40af', marginTop: '0.25rem' }}>
              {hiredApps}
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--color-slate-50)', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', flex: '1 1 280px' }}>
            <Search size={18} style={{ color: 'var(--color-slate-400)' }} />
            <input
              type="text"
              placeholder="Nach Kandidat, E-Mail oder Stelle suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {(['ALL', 'REJECTED', 'WITHDRAWN', 'HIRED', 'RECEIVED', 'SCREENING', 'INTERVIEW', 'OFFER'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              >
                {st === 'ALL' ? 'Alle Status' : st}
              </button>
            ))}

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--color-slate-700)', cursor: 'pointer', marginLeft: '0.5rem' }}>
              <input
                type="checkbox"
                checked={anonymizedOnly}
                onChange={(e) => setAnonymizedOnly(e.target.checked)}
                style={{ width: '15px', height: '15px' }}
              />
              Nur Anonymisierte
            </label>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.95rem' }}>Lade Archiv-Einträge...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <Archive size={40} style={{ color: 'var(--color-slate-300)', marginBottom: '0.75rem' }} />
            <h3 style={{ margin: 0, color: 'var(--color-slate-700)' }}>Keine Archiveinträge gefunden</h3>
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem', marginTop: '0.4rem' }}>
              Für die gewählten Kriterien existieren keine Bewerbungseinträge.
            </p>
          </div>
        ) : (
          <div className="card" style={{ backgroundColor: '#ffffff', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-slate-200)', background: 'var(--color-slate-50)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Bewerber-Dossier</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Stellenbezug</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>DSGVO-Löschfrist</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Datenschutz-Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase', textAlign: 'right' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--color-slate-100)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {app.is_anonymized ? (
                        <div style={{ color: 'var(--color-slate-500)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>[DSGVO-Anonymisiert]</span> #{app.id}
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-slate-900)', fontSize: '0.92rem' }}>
                            {app.first_name} {app.last_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '0.15rem' }}>
                            {app.email} {app.phone && `• ${app.phone}`}
                          </div>
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', marginTop: '0.2rem' }}>
                        Eingegangen am: {new Date(app.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-brand-700)' }}>
                        {app.job_posting_title || app.job_posting?.title || `Stelle #${app.job_posting_id}`}
                      </div>
                      {app.job_posting?.department && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.15rem' }}>
                          {app.job_posting.department.name}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      {getStatusBadge(app.status)}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--color-slate-700)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} style={{ color: 'var(--color-brand-600)' }} />
                        {app.retention_until ? new Date(app.retention_until).toLocaleDateString('de-DE') : 'Keine Angabe'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      {app.is_anonymized ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.6rem',
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}>
                          <ShieldCheck size={14} /> Anonymisiert
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.6rem',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 500
                        }}>
                          Aktiv (§ 26 BDSG)
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedAppId(app.id);
                            setIsDrawerOpen(true);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', gap: '0.35rem' }}
                          title="Vollständiges Dossier & Audit-Trail einsehen"
                        >
                          <FileText size={14} /> Dossier
                        </button>

                        {!app.is_anonymized && (
                          <button
                            onClick={() => handleManualAnonymize(app.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', gap: '0.35rem', color: '#b91c1c' }}
                            title="Vorzeitig manuell anonymisieren"
                          >
                            <ShieldCheck size={14} /> Anonymisieren
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Application Detail & Audit Drawer */}
        <ApplicationDetailDrawer
          applicationId={selectedAppId}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedAppId(null);
          }}
          onApplicationUpdated={() => fetchArchiveData()}
        />

      </div>
    </div>
  );
};
