import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Building2,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  AlertCircle,
  Users
} from 'lucide-react';
import type { JobPosting, Department, JobPostingStatus, EmploymentType } from '../types';
import { getJobs, deleteOrArchiveJob, getDepartments, updateJob } from '../services/api';
import { JobFormModal } from '../components/jobs/JobFormModal';
import { DepartmentManagerModal } from '../components/jobs/DepartmentManagerModal';
import { useAuth } from '../context/AuthContext';

export const JobsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Modal states
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, deptsData] = await Promise.all([
        getJobs({ page_size: 100 }),
        getDepartments(),
      ]);
      setJobs(jobsData.items);
      setDepartments(deptsData);
    } catch (err: any) {
      console.error('Fehler beim Laden der Stellenverwaltung:', err);
      setError(err.response?.data?.detail || null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewJob = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handleToggleStatus = async (job: JobPosting, newStatus: JobPostingStatus) => {
    try {
      await updateJob(job.id, { status: newStatus });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Status konnte nicht geändert werden.');
    }
  };

  const handleDeleteOrArchive = async (job: JobPosting) => {
    const confirmText = job.status === 'ARCHIVED'
      ? `Möchten Sie die Stelle "${job.title}" wirklich löschen?`
      : `Möchten Sie die Stelle "${job.title}" archivieren?`;

    if (window.confirm(confirmText)) {
      try {
        await deleteOrArchiveJob(job.id);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Aktion konnte nicht ausgeführt werden.');
      }
    }
  };

  // Filter logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true : job.status === statusFilter;

    const matchesDept =
      departmentFilter === 'ALL' ? true : job.department_id === Number(departmentFilter);

    return matchesSearch && matchesStatus && matchesDept;
  });

  // KPI Calculations
  const totalCount = jobs.length;
  const publishedCount = jobs.filter((j) => j.status === 'PUBLISHED').length;
  const draftCount = jobs.filter((j) => j.status === 'DRAFT').length;
  const archivedCount = jobs.filter((j) => j.status === 'ARCHIVED').length;

  const getEmploymentLabel = (type: EmploymentType) => {
    switch (type) {
      case 'FULL_TIME': return 'Vollzeit';
      case 'PART_TIME': return 'Teilzeit';
      case 'WORKING_STUDENT': return 'Werkstudent:in';
      case 'CONTRACT': return 'Contract';
      case 'INTERNSHIP': return 'Praktikum';
      default: return type;
    }
  };

  const getStatusBadge = (status: JobPostingStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            backgroundColor: '#dcfce7',
            color: '#166534',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <CheckCircle size={14} /> Veröffentlicht
          </span>
        );
      case 'DRAFT':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <Clock size={14} /> Entwurf
          </span>
        );
      case 'ARCHIVED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <Archive size={14} /> Archiviert
          </span>
        );
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-slate-50)', minHeight: 'calc(100vh - 140px)', padding: '2rem 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--color-slate-900)' }}>
              Stellenverwaltung & Ausschreibungen
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>
              Verwalten Sie hier alle offenen Stellen, Entwürfe und Unternehmensabteilungen
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isAdmin && (
              <button
                onClick={() => setIsDeptModalOpen(true)}
                className="btn btn-secondary"
                style={{ gap: '0.5rem', fontSize: '0.9rem' }}
              >
                <Building2 size={18} />
                Abteilungen verwalten
              </button>
            )}

            <button
              onClick={handleCreateNewJob}
              className="btn btn-primary"
              style={{ gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <Plus size={18} />
              Neue Stelle ausschreiben
            </button>
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
              Gesamt Stellen
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-slate-900)', marginTop: '0.25rem' }}>
              {totalCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderLeft: '4px solid #16a34a' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>
              Veröffentlicht (Aktiv)
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#166534', marginTop: '0.25rem' }}>
              {publishedCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderLeft: '4px solid #d97706' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>
              Entwürfe (DRAFT)
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#92400e', marginTop: '0.25rem' }}>
              {draftCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderLeft: '4px solid #64748b' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
              Archivierte Stellen
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
              {archivedCount}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="card" style={{
          padding: '1.25rem',
          backgroundColor: '#ffffff',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {[
              { id: 'ALL', label: 'Alle' },
              { id: 'PUBLISHED', label: 'Veröffentlicht' },
              { id: 'DRAFT', label: 'Entwürfe' },
              { id: 'ARCHIVED', label: 'Archiviert' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === tab.id ? 'var(--color-brand-600)' : 'var(--color-slate-100)',
                  color: statusFilter === tab.id ? '#ffffff' : 'var(--color-slate-700)',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Department Dropdown */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }} />
              <input
                type="text"
                placeholder="Stellentitel oder Standort..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ width: '100%', paddingLeft: '2.4rem', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="input"
                style={{ fontSize: '0.875rem', paddingRight: '2rem' }}
              >
                <option value="ALL">Alle Fachbereiche</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Table / List */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.95rem' }}>Lade Stellenangebote...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <Briefcase size={40} style={{ color: 'var(--color-slate-300)', marginBottom: '0.75rem' }} />
            <h3 style={{ margin: 0, color: 'var(--color-slate-700)' }}>Keine Stellenanzeigen gefunden</h3>
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem', marginTop: '0.4rem' }}>
              Es wurden keine Stellenanzeigen für die ausgewählten Filterkriterien gefunden.
            </p>
          </div>
        ) : (
          <div className="card" style={{ backgroundColor: '#ffffff', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-slate-200)', background: 'var(--color-slate-50)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Stellentitel</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Fachbereich</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Standort</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Anstellung</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase', textAlign: 'right' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    style={{ borderBottom: '1px solid var(--color-slate-100)', transition: 'background-color 0.15s ease' }}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div
                        onClick={() => navigate(`/recruiter?jobId=${job.id}`)}
                        style={{ fontWeight: 600, color: 'var(--color-brand-600)', fontSize: '0.95rem', cursor: 'pointer' }}
                        title="Bewerber zu dieser Stelle ansehen"
                      >
                        {job.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '0.15rem' }}>
                        Erstellt am: {new Date(job.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-slate-700)' }}>
                      {job.department?.name || `Fachbereich #${job.department_id}`}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-slate-700)' }}>
                      {job.location}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--color-slate-700)' }}>
                      {getEmploymentLabel(job.employment_type)}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      {getStatusBadge(job.status)}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          onClick={() => navigate(`/recruiter?jobId=${job.id}`)}
                          title="Bewerber-Pipeline dieser Stelle ansehen"
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', gap: '0.35rem', color: 'var(--color-brand-700)' }}
                        >
                          <Users size={14} /> Bewerber
                        </button>

                        {job.status === 'DRAFT' && (
                          <button
                            onClick={() => handleToggleStatus(job, 'PUBLISHED')}
                            title="Stelle veröffentlichen"
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem', color: '#166534' }}
                          >
                            <CheckCircle size={14} /> Veröffentlichen
                          </button>
                        )}

                        {job.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleToggleStatus(job, 'DRAFT')}
                            title="In Entwurf zurückversetzen"
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem', color: '#92400e' }}
                          >
                            <Clock size={14} /> Pausieren
                          </button>
                        )}

                        <button
                          onClick={() => handleEditJob(job)}
                          title="Bearbeiten"
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteOrArchive(job)}
                          title="Archivieren / Löschen"
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: '#dc2626' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <JobFormModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onJobSaved={fetchData}
        editingJob={editingJob}
      />

      {isAdmin && (
        <DepartmentManagerModal
          isOpen={isDeptModalOpen}
          onClose={() => setIsDeptModalOpen(false)}
          onDepartmentAdded={fetchData}
        />
      )}
    </div>
  );
};
