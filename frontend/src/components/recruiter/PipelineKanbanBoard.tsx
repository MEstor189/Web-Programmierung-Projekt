import React, { useState } from 'react';
import {
  Clock,
  Eye,
  DollarSign,
  Calendar,
  Briefcase,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Search
} from 'lucide-react';
import type { Application, ApplicationStatus, JobPosting } from '../../types';

interface PipelineKanbanBoardProps {
  applications: Application[];
  jobs: JobPosting[];
  selectedJobId: number | 'ALL';
  onSelectJobId: (jobId: number | 'ALL') => void;
  onOpenApplication: (applicationId: number) => void;
  onStatusChange: (applicationId: number, newStatus: ApplicationStatus) => void;
}

interface ColumnConfig {
  status: ApplicationStatus;
  title: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  description: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'RECEIVED',
    title: 'Eingegangen',
    color: '#2563eb',
    badgeBg: '#eff6ff',
    borderColor: '#3b82f6',
    description: 'Neu eingetroffene Bewerbungen',
  },
  {
    status: 'SCREENING',
    title: 'In Prüfung',
    color: '#d97706',
    badgeBg: '#fef3c7',
    borderColor: '#f59e0b',
    description: 'Fachliches & HR-Screening',
  },
  {
    status: 'INTERVIEW',
    title: 'Interview',
    color: '#7c3aed',
    badgeBg: '#f3e8ff',
    borderColor: '#8b5cf6',
    description: 'Fach- & Kennenlerngespräche',
  },
  {
    status: 'OFFER',
    title: 'Angebot',
    color: '#059669',
    badgeBg: '#ecfdf5',
    borderColor: '#10b981',
    description: 'Vertragsangebot versendet',
  },
  {
    status: 'HIRED',
    title: 'Eingestellt',
    color: '#16a34a',
    badgeBg: '#dcfce7',
    borderColor: '#22c55e',
    description: 'Vertrag unterschrieben',
  },
  {
    status: 'REJECTED',
    title: 'Archiv & Absagen',
    color: '#dc2626',
    badgeBg: '#fee2e2',
    borderColor: '#ef4444',
    description: 'Absagen & zurückgezogene Bewerbungen',
  },
];

const STATUS_STYLES: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  RECEIVED: { label: 'Eingegangen', color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
  SCREENING: { label: 'In Prüfung', color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
  INTERVIEW: { label: 'Interview', color: '#6d28d9', bg: '#f3e8ff', border: '#d8b4fe' },
  OFFER: { label: 'Angebot', color: '#047857', bg: '#ecfdf5', border: '#6ee7b7' },
  HIRED: { label: 'Eingestellt', color: '#15803d', bg: '#dcfce7', border: '#86efac' },
  REJECTED: { label: 'Absage', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
  WITHDRAWN: { label: 'Zurückgezogen', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
};

type DensityMode = 'detailed' | 'compact';
type SortOption = 'newest' | 'oldest' | 'name' | 'salary_desc';

export const PipelineKanbanBoard: React.FC<PipelineKanbanBoardProps> = ({
  applications,
  jobs,
  selectedJobId,
  onSelectJobId,
  onOpenApplication,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [density, setDensity] = useState<DensityMode>('detailed');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({});

  const toggleColumnCollapse = (status: string) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  // Filter and sort applications
  const filteredApps = applications
    .filter((app) => {
      const matchesJob =
        selectedJobId === 'ALL' ? true : app.job_posting_id === selectedJobId;
      const matchesSearch =
        `${app.first_name} ${app.last_name} ${app.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesJob && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'name') {
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      }
      if (sortBy === 'salary_desc') {
        return (Number(b.expected_salary) || 0) - (Number(a.expected_salary) || 0);
      }
      return 0;
    });

  const getAppsForColumn = (status: ApplicationStatus) => {
    if (status === 'REJECTED') {
      return filteredApps.filter((app) => app.status === 'REJECTED' || app.status === 'WITHDRAWN');
    }
    return filteredApps.filter((app) => app.status === status);
  };

  const getRelativeTimeString = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours === 0) return 'Gerade eben';
      return `Vor ${diffHours} Std.`;
    }
    if (diffDays === 1) return 'Gestern';
    return `Vor ${diffDays} Tagen`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Control Bar: Job Selector, Search, Sorting & Density Toggle */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Left: Job Filter & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Layers size={16} style={{ color: 'var(--color-brand-600)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
              Stelle:
            </span>
            <select
              className="input"
              value={selectedJobId}
              onChange={(e) =>
                onSelectJobId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem', minWidth: '200px' }}
            >
              <option value="ALL">🏢 Alle Stellen ({applications.length} Kandidaten)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.location})
                </option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '320px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
            <input
              type="text"
              className="input"
              placeholder="Name oder E-Mail suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', fontSize: '0.825rem', padding: '0.4rem 0.75rem 0.4rem 2.1rem' }}
            />
          </div>
        </div>

        {/* Right: Sorting, Density Mode & Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Sorting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUpDown size={14} style={{ color: 'var(--color-slate-500)' }} />
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              title="Sortierung der Bewerbungen"
            >
              <option value="newest">Neueste zuerst</option>
              <option value="oldest">Älteste zuerst (Liegedauer)</option>
              <option value="name">Name (A-Z)</option>
              <option value="salary_desc">Höchste Gehaltsvorstellung</option>
            </select>
          </div>

          {/* Density Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-slate-100)',
              padding: '0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-slate-200)',
            }}
          >
            <button
              type="button"
              onClick={() => setDensity('detailed')}
              style={{
                border: 'none',
                background: density === 'detailed' ? '#ffffff' : 'transparent',
                color: density === 'detailed' ? 'var(--color-brand-600)' : 'var(--color-slate-600)',
                padding: '0.25rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.775rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                boxShadow: density === 'detailed' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
              title="Detaillierte Kartenansicht mit Gehalt und Fristen"
            >
              <List size={13} />
              Detailliert
            </button>
            <button
              type="button"
              onClick={() => setDensity('compact')}
              style={{
                border: 'none',
                background: density === 'compact' ? '#ffffff' : 'transparent',
                color: density === 'compact' ? 'var(--color-brand-600)' : 'var(--color-slate-600)',
                padding: '0.25rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.775rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                boxShadow: density === 'compact' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
              title="Kompakte Kartenansicht für maximalen Überblick bei vielen Bewerbungen"
            >
              <LayoutGrid size={13} />
              Kompakt
            </button>
          </div>

          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-slate-600)',
              backgroundColor: 'var(--color-slate-100)',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {filteredApps.length} Bewerbungen
          </span>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: COLUMNS.map((col) =>
            collapsedColumns[col.status] ? '48px' : 'minmax(240px, 1fr)'
          ).join(' '),
          gap: '0.85rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          alignItems: 'start',
          width: '100%',
          transition: 'grid-template-columns 0.2s ease-in-out',
        }}
      >
        {COLUMNS.map((col) => {
          const colApps = getAppsForColumn(col.status);
          const isCollapsed = !!collapsedColumns[col.status];

          if (isCollapsed) {
            return (
              <div
                key={col.status}
                onClick={() => toggleColumnCollapse(col.status)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-slate-200)',
                  borderTop: `4px solid ${col.borderColor}`,
                  height: 'calc(100vh - 280px)',
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.75rem 0.25rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'background-color 0.15s ease',
                }}
                title={`${col.title} aufklappen (${colApps.length} Bewerbungen)`}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-slate-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-slate-500)',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <ChevronRight size={16} />
                </button>

                <span
                  style={{
                    background: col.badgeBg,
                    color: col.color,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                  }}
                >
                  {colApps.length}
                </span>

                <div
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--color-slate-800)',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.title}
                </div>
              </div>
            );
          }

          return (
            <div
              key={col.status}
              style={{
                backgroundColor: 'var(--color-slate-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-200)',
                borderTop: `4px solid ${col.borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 280px)',
                minHeight: '480px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              {/* Sticky Column Header */}
              <div
                style={{
                  padding: '0.75rem 0.85rem',
                  borderBottom: '1px solid var(--color-slate-200)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <h3
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        margin: 0,
                        color: 'var(--color-slate-900)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.title}
                    </h3>
                    <span
                      style={{
                        background: col.badgeBg,
                        color: col.color,
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '10px',
                      }}
                    >
                      {colApps.length}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-slate-400)',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: '0.1rem',
                    }}
                  >
                    {col.description}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleColumnCollapse(col.status)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-slate-400)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Spalte einklappen"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              {/* Independently Scrollable Column Body */}
              <div
                style={{
                  padding: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  flex: 1,
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                }}
              >
                {colApps.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2.5rem 1rem',
                      color: 'var(--color-slate-400)',
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                    }}
                  >
                    Keine Bewerbungen in dieser Phase
                  </div>
                ) : (
                  colApps.map((app) => {
                    const isCompact = density === 'compact';

                    if (isCompact) {
                      return (
                        <div
                          key={app.id}
                          className="card"
                          style={{
                            padding: '0.6rem 0.75rem',
                            backgroundColor: '#ffffff',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-slate-200)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          }}
                          onClick={() => onOpenApplication(app.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                margin: 0,
                                color: 'var(--color-slate-900)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {app.first_name} {app.last_name}
                            </h4>
                            <span style={{ fontSize: '0.68rem', color: 'var(--color-slate-400)' }}>
                              #{app.id}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                            <span style={{ color: 'var(--color-slate-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                              {app.job_posting_title || app.job_posting?.title || 'Stelle'}
                            </span>
                            <span style={{ color: 'var(--color-slate-400)' }}>
                              {getRelativeTimeString(app.created_at)}
                            </span>
                          </div>

                          {/* Compact Action Bar */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              paddingTop: '0.35rem',
                              borderTop: '1px solid var(--color-slate-100)',
                              marginTop: '0.1rem',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={app.status}
                              onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '0.15rem 0.35rem',
                                borderRadius: '3px',
                                border: `1px solid ${STATUS_STYLES[app.status]?.border || 'var(--color-slate-300)'}`,
                                backgroundColor: STATUS_STYLES[app.status]?.bg || '#ffffff',
                                color: STATUS_STYLES[app.status]?.color || 'var(--color-slate-700)',
                                cursor: 'pointer',
                                maxWidth: '120px',
                              }}
                            >
                              <option value="RECEIVED" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>Eingegangen</option>
                              <option value="SCREENING" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 600 }}>In Prüfung</option>
                              <option value="INTERVIEW" style={{ backgroundColor: '#f3e8ff', color: '#6d28d9', fontWeight: 600 }}>Interview</option>
                              <option value="OFFER" style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 600 }}>Angebot</option>
                              <option value="HIRED" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}>Eingestellt</option>
                              <option value="REJECTED" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 600 }}>Absage</option>
                              <option value="WITHDRAWN" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>Zurückgezogen</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => onOpenApplication(app.id)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--color-brand-600)',
                                padding: '0.2rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Akte öffnen"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Detailed Card View
                    return (
                      <div
                        key={app.id}
                        className="card"
                        style={{
                          padding: '0.85rem',
                          backgroundColor: '#ffffff',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-slate-200)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.55rem',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onClick={() => onOpenApplication(app.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.09)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                        }}
                      >
                        {/* Top Meta Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} />
                            {getRelativeTimeString(app.created_at)}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {app.status === 'WITHDRAWN' && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                Zurückgezogen
                              </span>
                            )}
                            <span
                              className="badge"
                              style={{
                                fontSize: '0.7rem',
                                background: 'var(--color-brand-50)',
                                color: 'var(--color-brand-700)',
                                padding: '0.15rem 0.45rem',
                              }}
                            >
                              Ref #{app.id}
                            </span>
                          </div>
                        </div>

                        {/* Candidate Name */}
                        <div>
                          <h4
                            style={{
                              fontSize: '0.94rem',
                              fontWeight: 700,
                              margin: '0 0 0.15rem 0',
                              color: 'var(--color-slate-900)',
                            }}
                          >
                            {app.first_name} {app.last_name}
                          </h4>
                          <p
                            style={{
                              fontSize: '0.76rem',
                              color: 'var(--color-brand-700)',
                              background: 'var(--color-brand-50)',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              margin: '0.2rem 0 0 0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontWeight: 500,
                            }}
                          >
                            <Briefcase size={12} />
                            {app.job_posting_title || app.job_posting?.title || 'Stellenangebot'}
                          </p>
                        </div>

                        {/* Details snippet */}
                        {(app.expected_salary || app.notice_period) && (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              color: 'var(--color-slate-600)',
                              background: 'var(--color-slate-50)',
                              padding: '0.45rem 0.6rem',
                              borderRadius: '6px',
                            }}
                          >
                            {app.expected_salary && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <DollarSign size={12} style={{ color: 'var(--color-brand-600)' }} />
                                <span>{Number(app.expected_salary).toLocaleString('de-DE')} €/Jahr</span>
                              </div>
                            )}

                            {app.notice_period && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Calendar size={12} style={{ color: 'var(--color-slate-400)' }} />
                                <span>Frist: {app.notice_period}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Card Bottom Actions */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '0.2rem',
                            paddingTop: '0.45rem',
                            borderTop: '1px solid var(--color-slate-100)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={app.status}
                            onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.45rem',
                              borderRadius: '4px',
                              border: `1px solid ${STATUS_STYLES[app.status]?.border || 'var(--color-slate-300)'}`,
                              backgroundColor: STATUS_STYLES[app.status]?.bg || '#ffffff',
                              color: STATUS_STYLES[app.status]?.color || 'var(--color-slate-700)',
                              cursor: 'pointer',
                              maxWidth: '135px',
                            }}
                          >
                            <option value="RECEIVED" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>Eingegangen</option>
                            <option value="SCREENING" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 600 }}>In Prüfung</option>
                            <option value="INTERVIEW" style={{ backgroundColor: '#f3e8ff', color: '#6d28d9', fontWeight: 600 }}>Interview</option>
                            <option value="OFFER" style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 600 }}>Angebot</option>
                            <option value="HIRED" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600 }}>Eingestellt</option>
                            <option value="REJECTED" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 600 }}>Absage</option>
                            <option value="WITHDRAWN" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>Zurückgezogen</option>
                          </select>

                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => onOpenApplication(app.id)}
                            style={{
                              fontSize: '0.74rem',
                              padding: '0.2rem 0.5rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Eye size={12} />
                            Akte
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
