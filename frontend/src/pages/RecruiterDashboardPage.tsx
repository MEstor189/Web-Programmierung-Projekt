import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
  RefreshCw,
  Eye,
  Sparkles
} from 'lucide-react';
import type { Application, JobPosting, ApplicationStatus } from '../types';
import { getApplicationsApi, getJobs, updateApplicationStatusApi } from '../services/api';
import { PipelineKanbanBoard } from '../components/recruiter/PipelineKanbanBoard';
import { ApplicationDetailDrawer } from '../components/recruiter/ApplicationDetailDrawer';

export const RecruiterDashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View & Filter states
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedJobId, setSelectedJobId] = useState<number | 'ALL'>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('ALL');

  // Drawer modal state
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Read URL jobId parameter (e.g. from JobsManagementPage)
  useEffect(() => {
    const jobIdParam = searchParams.get('jobId');
    if (jobIdParam) {
      const parsed = Number(jobIdParam);
      if (!isNaN(parsed) && parsed > 0) {
        setSelectedJobId(parsed);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsData, jobsData] = await Promise.all([
        getApplicationsApi({ page_size: 200 }),
        getJobs({ page_size: 100 }),
      ]);
      setApplications(appsData.items);
      setJobs(jobsData.items);
    } catch (err: any) {
      console.error('Fehler beim Laden des Recruiter-Dashboards:', err);
      setError(err.response?.data?.detail || null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApplication = (id: number) => {
    setSelectedAppId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAppId(null);
  };

  const handleStatusChange = async (id: number, newStatus: ApplicationStatus) => {
    try {
      await updateApplicationStatusApi(id, newStatus);
      // Refresh list to update state
      const updated = await getApplicationsApi({ page_size: 200 });
      setApplications(updated.items);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Status konnte nicht aktualisiert werden.');
    }
  };

  // Calculate live KPIs
  const activeJobsCount = jobs.filter((j) => j.status === 'PUBLISHED').length;
  const totalAppsCount = applications.length;
  const pendingScreeningOrInterviewCount = applications.filter((a) =>
    ['RECEIVED', 'SCREENING', 'INTERVIEW'].includes(a.status)
  ).length;
  const hiredOrOfferCount = applications.filter((a) =>
    ['OFFER', 'HIRED'].includes(a.status)
  ).length;

  // Filter applications for table view
  const filteredTableApps = applications.filter((app) => {
    const matchesJob =
      selectedJobId === 'ALL' ? true : app.job_posting_id === selectedJobId;
    const matchesStatus =
      tableStatusFilter === 'ALL' ? true : app.status === tableStatusFilter;
    const matchesSearch =
      `${app.first_name} ${app.last_name} ${app.email}`
        .toLowerCase()
        .includes(tableSearch.toLowerCase());
    return matchesJob && matchesStatus && matchesSearch;
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
    <div style={{ padding: '1.75rem 0', background: 'var(--color-bg-secondary, #f8fafc)', minHeight: 'calc(100vh - 120px)', width: '100%' }}>
      <div style={{ width: '100%', padding: '0 1.75rem' }}>
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.85rem', color: 'var(--color-slate-900)' }}>Recruiter Cockpit & Pipeline</h1>
            </div>
            <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', margin: 0 }}>
              Übersicht, Bewertung und Statussteuerung aller eingehenden Bewerbungen
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={fetchDashboardData}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spinner' : ''} />
              Aktualisieren
            </button>

            <Link
              to="/recruiter/jobs"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
            >
              <Briefcase size={15} />
              Stellenverwaltung ({jobs.length})
            </Link>
          </div>
        </div>

        {/* Live KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div
              style={{
                background: 'var(--color-brand-50, #eff6ff)',
                color: 'var(--color-brand-600, #2563eb)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
              }}
            >
              <Briefcase size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                Aktive Stellenangebote
              </span>
              <h3 style={{ fontSize: '1.6rem', margin: '0.1rem 0 0 0', fontWeight: 700 }}>
                {activeJobsCount} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--color-slate-500)' }}>/ {jobs.length} gesamt</span>
              </h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div
              style={{
                background: 'var(--color-success-bg, #f0fdf4)',
                color: 'var(--color-success-text, #166534)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                Bewerbungen Gesamt
              </span>
              <h3 style={{ fontSize: '1.6rem', margin: '0.1rem 0 0 0', fontWeight: 700 }}>
                {totalAppsCount}
              </h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div
              style={{
                background: 'var(--color-warning-bg, #fffbeb)',
                color: 'var(--color-warning-text, #b45309)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                In Prüfung / Interview
              </span>
              <h3 style={{ fontSize: '1.6rem', margin: '0.1rem 0 0 0', fontWeight: 700 }}>
                {pendingScreeningOrInterviewCount}
              </h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div
              style={{
                background: '#f3e8ff',
                color: '#6b21a8',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md, 8px)',
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                Angebote & Einstellungen
              </span>
              <h3 style={{ fontSize: '1.6rem', margin: '0.1rem 0 0 0', fontWeight: 700 }}>
                {hiredOrOfferCount}
              </h3>
            </div>
          </div>
        </div>

        {/* View Switcher & Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* View Toggle Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', padding: '3px', borderRadius: '8px', border: '1px solid var(--color-slate-200)' }}>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: viewMode === 'kanban' ? 600 : 500,
                background: viewMode === 'kanban' ? 'var(--color-brand-600, #2563eb)' : 'transparent',
                color: viewMode === 'kanban' ? '#ffffff' : 'var(--color-slate-600)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={15} />
              Kanban-Pipeline
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: viewMode === 'table' ? 600 : 500,
                background: viewMode === 'table' ? 'var(--color-brand-600, #2563eb)' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : 'var(--color-slate-600)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <List size={15} />
              Tabellen-Übersicht
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.95rem' }}>Lade Pipeline-Daten...</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <PipelineKanbanBoard
            applications={applications}
            jobs={jobs}
            selectedJobId={selectedJobId}
            onSelectJobId={setSelectedJobId}
            onOpenApplication={handleOpenApplication}
            onStatusChange={handleStatusChange}
          />
        ) : (
          /* Table View */
          <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
            {/* Table Filters */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Bewerber nach Name oder E-Mail suchen..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  style={{ minWidth: '240px', fontSize: '0.85rem' }}
                />

                <select
                  className="form-input"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="ALL">🏢 Alle Stellen</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>

                <select
                  className="form-input"
                  value={tableStatusFilter}
                  onChange={(e) => setTableStatusFilter(e.target.value)}
                  style={{ fontSize: '0.85rem', fontWeight: 500 }}
                >
                  <option value="ALL">Alle Phasen</option>
                  <option value="RECEIVED" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>Eingegangen</option>
                  <option value="SCREENING" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 600 }}>In Prüfung</option>
                  <option value="INTERVIEW" style={{ backgroundColor: '#f3e8ff', color: '#6d28d9', fontWeight: 600 }}>Interview</option>
                  <option value="OFFER" style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 600 }}>Angebot</option>
                  <option value="HIRED" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}>Eingestellt</option>
                  <option value="REJECTED" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 600 }}>Absage</option>
                  <option value="WITHDRAWN" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>Zurückgezogen</option>
                </select>
              </div>

              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>
                {filteredTableApps.length} Bewerbungen
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-slate-200)', textAlign: 'left', color: 'var(--color-slate-600)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Bewerber:in</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Position / Abteilung</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Phase (Status)</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Gehaltswunsch</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Eingegangen am</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-slate-400)' }}>
                        Keine Bewerbungen gefunden für die gewählten Filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTableApps.map((app) => (
                      <tr
                        key={app.id}
                        style={{ borderBottom: '1px solid var(--color-slate-100)', transition: 'background 0.1s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-slate-50)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                            {app.first_name} {app.last_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                            {app.email}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 500, color: 'var(--color-slate-800)' }}>
                            {app.job_posting?.title || 'Stelle #' + app.job_posting_id}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                            {app.job_posting?.location || '–'}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          {getStatusBadge(app.status)}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-slate-700)' }}>
                          {app.expected_salary
                            ? `${Number(app.expected_salary).toLocaleString('de-DE')} €`
                            : '–'}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-slate-500)', fontSize: '0.82rem' }}>
                          {new Date(app.created_at).toLocaleDateString('de-DE')}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleOpenApplication(app.id)}
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Eye size={13} />
                            Akte öffnen
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Candidate Detail Drawer */}
        <ApplicationDetailDrawer
          applicationId={selectedAppId}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onApplicationUpdated={fetchDashboardData}
        />
      </div>
    </div>
  );
};
