import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle, Shield } from 'lucide-react';
import type { User, UserRole, Department, UserCreatePayload, UserUpdatePayload } from '../../types';
import { createUserApi, updateUserApi, getDepartments } from '../../services/api';

interface UserFormModalProps {
  userToEdit: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  userToEdit,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(userToEdit);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('RECRUITER');
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Fehler beim Laden der Abteilungen:', err);
      }
    };
    if (isOpen) {
      loadDepts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (userToEdit) {
      setFirstName(userToEdit.first_name || '');
      setLastName(userToEdit.last_name || '');
      setEmail(userToEdit.email || '');
      setPassword('');
      setRole(userToEdit.role || 'RECRUITER');
      setDepartmentId(userToEdit.department_id);
      setIsActive(userToEdit.is_active);
      setError(null);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('RECRUITER');
      setDepartmentId(undefined);
      setIsActive(true);
      setError(null);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEditing && (!password || password.length < 6)) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && userToEdit) {
        const updatePayload: UserUpdatePayload = {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
          department_id: departmentId,
          is_active: isActive,
          password: password.trim() ? password : undefined,
        };
        await updateUserApi(userToEdit.id, updatePayload);
      } else {
        const createPayload: UserCreatePayload = {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          department_id: departmentId,
          is_active: isActive,
        };
        await createUserApi(createPayload);
      }

      setIsSubmitting(false);
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Fehler beim Speichern des Benutzers:', err);
      setError(err.response?.data?.detail || 'Fehler beim Speichern des Benutzers.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-slate-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'var(--color-brand-50)',
              color: 'var(--color-brand-600)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-brand-600)', textTransform: 'uppercase' }}>
                Benutzerverwaltung
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--color-slate-900)' }}>
                {isEditing ? `Benutzer bearbeiten: ${userToEdit?.first_name} ${userToEdit?.last_name}` : 'Neuen Benutzer anlegen'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}
            title="Schließen"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {error && (
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Vorname <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="z.B. Sarah"
                className="input"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Nachname <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="z.B. Müller"
                className="input"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              E-Mail-Adresse <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah.mueller@techcorp.de"
              disabled={isEditing}
              className="input"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                fontSize: '0.875rem',
                backgroundColor: isEditing ? 'var(--color-slate-100)' : '#ffffff',
                cursor: isEditing ? 'not-allowed' : 'text'
              }}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
              {isEditing ? 'Neues Passwort (leer lassen, um bestehendes beizubehalten)' : 'Initiales Passwort *'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? '••••••••' : 'Mindestens 6 Zeichen'}
              className="input"
              style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
              required={!isEditing}
            />
          </div>

          {/* Role & Department */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                System-Rolle <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="input"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                <option value="RECRUITER">Recruiter (Personalabteilung)</option>
                <option value="ADMIN">Administrator (Vollzugriff)</option>
                <option value="CANDIDATE">Kandidat / Bewerber</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Fachbereich (optional)
              </label>
              <select
                value={departmentId || ''}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)}
                className="input"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                <option value="">Keine Fachbereichszuordnung</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Toggle Checkbox */}
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--color-slate-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-slate-200)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <input
              type="checkbox"
              id="isActiveToggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="isActiveToggle" style={{ fontSize: '0.85rem', color: 'var(--color-slate-800)', cursor: 'pointer' }}>
              <strong>Benutzerkonto aktiv</strong> (Aktivierte Benutzer können sich im System anmelden)
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-slate-200)',
            marginTop: '0.5rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ gap: '0.45rem' }}
            >
              <UserCheck size={16} />
              {isSubmitting ? 'Wird gespeichert...' : isEditing ? 'Änderungen speichern' : 'Benutzer anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
