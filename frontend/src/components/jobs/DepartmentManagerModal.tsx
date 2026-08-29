import React, { useState, useEffect } from 'react';
import { X, Plus, Building2, AlertCircle } from 'lucide-react';
import type { Department } from '../../types';
import { getDepartments, createDepartment } from '../../services/api';

interface DepartmentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartmentAdded: () => void;
}

export const DepartmentManagerModal: React.FC<DepartmentManagerModalProps> = ({
  isOpen,
  onClose,
  onDepartmentAdded,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields for new department
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDeps();
    }
  }, [isOpen]);

  const fetchDeps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Fehler beim Laden der Abteilungen');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Bitte geben Sie einen Abteilungsnamen ein.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createDepartment({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      fetchDeps();
      onDepartmentAdded();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Fehler beim Erstellen der Abteilung');
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
          maxWidth: '650px',
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
        {/* Header */}
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
            <Building2 size={24} style={{ color: 'var(--color-brand-600)' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-slate-900)' }}>
                Fachbereiche & Abteilungen
              </h3>
              <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-slate-600)' }}>
                Übersicht und Erfassung von Unternehmensabteilungen
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

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

          {/* Form to create new department */}
          <form
            onSubmit={handleCreate}
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-200)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-slate-800)' }}>
              Neue Abteilung anlegen
            </h4>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Abteilungsname *
              </label>
              <input
                type="text"
                placeholder="z. B. Software Engineering, Produktmanagement..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Beschreibung (Optional)
              </label>
              <input
                type="text"
                placeholder="Kurze Beschreibung der Aufgaben des Fachbereichs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ gap: '0.4rem', fontSize: '0.875rem' }}
              >
                <Plus size={16} />
                {submitting ? 'Speichere...' : 'Abteilung hinzufügen'}
              </button>
            </div>
          </form>

          {/* Department List */}
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--color-slate-800)' }}>
              Bestehende Fachbereiche ({departments.length})
            </h4>
            {loading ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)' }}>Lade Abteilungen...</p>
            ) : departments.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)' }}>Noch keine Fachbereiche vorhanden.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-slate-200)',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>{dept.name}</span>
                      {dept.description && (
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-slate-600)' }}>
                          {dept.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-slate-200)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--color-slate-50)',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
