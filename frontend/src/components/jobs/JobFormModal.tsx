import React, { useState, useEffect } from 'react';
import { X, Briefcase, AlertCircle, Save } from 'lucide-react';
import type { JobPosting, Department, EmploymentType, JobPostingStatus } from '../../types';
import { createJob, updateJob, getDepartments } from '../../services/api';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobSaved: () => void;
  editingJob?: JobPosting | null;
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onJobSaved,
  editingJob,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [location, setLocation] = useState('Remote / Hybrid (Deutschland)');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [status, setStatus] = useState<JobPostingStatus>('DRAFT');

  useEffect(() => {
    if (isOpen) {
      fetchDeps();
      if (editingJob) {
        setTitle(editingJob.title);
        setDepartmentId(editingJob.department_id);
        setLocation(editingJob.location);
        setEmploymentType(editingJob.employment_type);
        setDescription(editingJob.description);
        setRequirements(editingJob.requirements);
        setBenefits(editingJob.benefits || '');
        setStatus(editingJob.status);
      } else {
        // Reset form for creation
        setTitle('');
        setDepartmentId('');
        setLocation('Remote / Hybrid (Deutschland)');
        setEmploymentType('FULL_TIME');
        setDescription('');
        setRequirements('');
        setBenefits('');
        setStatus('DRAFT');
      }
    }
  }, [isOpen, editingJob]);

  const fetchDeps = async () => {
    setLoadingDepartments(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
      if (data.length > 0 && !editingJob && departmentId === '') {
        setDepartmentId(data[0].id);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Abteilungen:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !departmentId || !location.trim() || !description.trim() || !requirements.trim()) {
      setError('Bitte fülle alle Pflichtfelder (Titel, Fachbereich, Standort, Beschreibung, Anforderungen) aus.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      department_id: Number(departmentId),
      location: location.trim(),
      employment_type: employmentType,
      description: description.trim(),
      requirements: requirements.trim(),
      benefits: benefits.trim() || undefined,
      status: status,
    };

    try {
      if (editingJob) {
        await updateJob(editingJob.id, payload);
      } else {
        await createJob(payload);
      }
      onJobSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Fehler beim Speichern der Stellenanzeige.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-slate-200)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-slate-50)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase size={24} style={{ color: 'var(--color-brand-600)' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-slate-900)' }}>
                {editingJob ? 'Stellenausschreibung bearbeiten' : 'Neue Stellenanzeige erstellen'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-slate-600)' }}>
                Erfassen Sie alle relevanten Details für Bewerber:innen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Job Title */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Stellentitel *
            </label>
            <input
              type="text"
              placeholder="z. B. Senior Fullstack Developer (m/w/d)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Grid: Department, Employment Type, Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Fachbereich / Abteilung *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(Number(e.target.value))}
                className="input"
                style={{ width: '100%' }}
                required
              >
                {loadingDepartments ? (
                  <option value="">Lade Abteilungen...</option>
                ) : (
                  departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Anstellungsart *
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="FULL_TIME">Vollzeit (Full Time)</option>
                <option value="PART_TIME">Teilzeit (Part Time)</option>
                <option value="WORKING_STUDENT">Werkstudent:in</option>
                <option value="CONTRACT">Freiberuflich / Contract</option>
                <option value="INTERNSHIP">Praktikum / Internship</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Veröffentlichungsstatus *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobPostingStatus)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="DRAFT">Entwurf (Draft)</option>
                <option value="PUBLISHED">Veröffentlicht (Published)</option>
                <option value="ARCHIVED">Archiviert (Archived)</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Standort *
            </label>
            <input
              type="text"
              placeholder="z. B. München / Remote (Deutschland)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Stellenbeschreibung & Aufgaben *
            </label>
            <textarea
              placeholder="Detaillierte Aufgabenbeschreibung, Teamstruktur und Herausforderungen..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              style={{ width: '100%', minHeight: '120px', fontFamily: 'inherit', resize: 'vertical' }}
              required
            />
          </div>

          {/* Requirements */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Anforderungsprofil & Qualifikationen *
            </label>
            <textarea
              placeholder="Erforderliche Kenntnisse, Ausbildungen, Skills (z. B. React, Java, Spring Boot, Teamfähigkeit)..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="input"
              style={{ width: '100%', minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
              required
            />
          </div>

          {/* Benefits */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              Benefits & Angebote (Optional)
            </label>
            <textarea
              placeholder="Corporate Benefits, Weiterbildungsbudget, 30 Tage Urlaub, Flexwork..."
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="input"
              style={{ width: '100%', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-slate-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ gap: '0.5rem' }}
            >
              <Save size={18} />
              {submitting ? 'Speichere...' : editingJob ? 'Änderungen speichern' : 'Stelle anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
