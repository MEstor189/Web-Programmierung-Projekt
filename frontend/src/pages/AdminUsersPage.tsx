import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  UserCheck
} from 'lucide-react';
import type { User, UserRole } from '../types';
import { getUsersApi, updateUserApi, deleteUserApi } from '../services/api';
import { UserFormModal } from '../components/admin/UserFormModal';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Delete Confirm State
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsersApi({ page_size: 200 });
      setUsers(data.items);
    } catch (err: any) {
      console.error('Fehler beim Laden der Benutzer:', err);
      setError(err.response?.data?.detail || 'Benutzer konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: User) => {
    try {
      await updateUserApi(user.id, { is_active: !user.is_active });
      setSuccessMsg(`Status für ${user.first_name} ${user.last_name} erfolgreich geändert.`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Status konnte nicht aktualisiert werden.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setIsDeleting(true);
    try {
      await deleteUserApi(deleteTargetUser.id);
      setSuccessMsg(`Benutzer ${deleteTargetUser.first_name} ${deleteTargetUser.last_name} wurde gelöscht.`);
      setDeleteTargetUser(null);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Benutzer konnte nicht gelöscht werden.');
    } finally {
      setIsDeleting(false);
    }
  };

  // KPIs
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const recruiterCount = users.filter((u) => u.role === 'RECRUITER').length;
  const candidateCount = users.filter((u) => u.role === 'CANDIDATE').length;

  // Filtered List
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch = `${u.first_name} ${u.last_name} ${u.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            backgroundColor: '#ede9fe',
            color: '#6d28d9',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <Shield size={13} /> Administrator
          </span>
        );
      case 'RECRUITER':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <Users size={13} /> Recruiter
          </span>
        );
      case 'CANDIDATE':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 600
          }}>
            <UserCheck size={13} /> Bewerber
          </span>
        );
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-slate-50)', minHeight: 'calc(100vh - 140px)', padding: '2rem 0' }}>
      <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '0 1.5rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div style={{
                background: 'var(--color-brand-50)',
                color: 'var(--color-brand-600)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <Shield size={22} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.85rem', color: 'var(--color-slate-900)' }}>
                Benutzer- & Rollenverwaltung
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--color-slate-600)', fontSize: '0.95rem' }}>
              Administrieren Sie Benutzerkonten, Rollenberechtigungen und Zugriffsstatus
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="btn btn-secondary"
              style={{ gap: '0.45rem', fontSize: '0.88rem' }}
            >
              <RefreshCw size={15} className={loading ? 'spinner' : ''} />
              Aktualisieren
            </button>

            <button
              onClick={() => {
                setUserToEdit(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ gap: '0.5rem', fontSize: '0.88rem' }}
            >
              <UserPlus size={16} />
              Neuen Benutzer anlegen
            </button>
          </div>
        </div>

        {/* Success / Error Alerts */}
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

        {/* KPI Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
              Gesamt Benutzer
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-slate-900)', marginTop: '0.25rem' }}>
              {totalCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderLeft: '4px solid #6d28d9' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d28d9' }}>
              Administratoren
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4c1d95', marginTop: '0.25rem' }}>
              {adminCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8' }}>
              Recruiter / HR
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e40af', marginTop: '0.25rem' }}>
              {recruiterCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderLeft: '4px solid #64748b' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
              Bewerber-Accounts
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
              {candidateCount}
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
              placeholder="Nach Name oder E-Mail suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
            />
          </div>

          {/* Role Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['ALL', 'ADMIN', 'RECRUITER', 'CANDIDATE'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`btn ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
              >
                {r === 'ALL' ? 'Alle Rollen' : r === 'ADMIN' ? 'Admins' : r === 'RECRUITER' ? 'Recruiter' : 'Bewerber'}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.95rem' }}>Lade Benutzerkonten...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <Users size={40} style={{ color: 'var(--color-slate-300)', marginBottom: '0.75rem' }} />
            <h3 style={{ margin: 0, color: 'var(--color-slate-700)' }}>Keine Benutzer gefunden</h3>
            <p style={{ color: 'var(--color-slate-500)', fontSize: '0.875rem', marginTop: '0.4rem' }}>
              Keine Einträge für die gewählten Suchkriterien vorhanden.
            </p>
          </div>
        ) : (
          <div className="card" style={{ backgroundColor: '#ffffff', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-slate-200)', background: 'var(--color-slate-50)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Benutzer</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>E-Mail</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Rolle</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-600)', textTransform: 'uppercase', textAlign: 'right' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--color-slate-100)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-slate-900)', fontSize: '0.92rem' }}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '0.15rem' }}>
                        ID #{user.id} • Erstellt: {new Date(user.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: 'var(--color-slate-700)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={14} style={{ color: 'var(--color-slate-400)' }} />
                        {user.email}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      {getRoleBadge(user.role)}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        onClick={() => handleToggleActive(user)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: user.is_active ? '#15803d' : '#b91c1c',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2'
                        }}
                        title={user.is_active ? 'Konto ist aktiv (Klicken zum Deaktivieren)' : 'Konto ist inaktiv (Klicken zum Aktivieren)'}
                      >
                        {user.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {user.is_active ? 'Aktiv' : 'Gesperrt'}
                      </button>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setUserToEdit(user);
                            setIsModalOpen(true);
                          }}
                          title="Benutzer bearbeiten"
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          onClick={() => setDeleteTargetUser(user)}
                          title="Benutzer löschen"
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', color: '#dc2626' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Form Modal */}
        <UserFormModal
          userToEdit={userToEdit}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setUserToEdit(null);
          }}
          onSaved={() => {
            setSuccessMsg(userToEdit ? 'Benutzerdaten wurden aktualisiert.' : 'Neuer Benutzer wurde erfolgreich angelegt.');
            fetchUsers();
            setTimeout(() => setSuccessMsg(null), 3000);
          }}
        />

        {/* Delete Confirm Modal */}
        {deleteTargetUser && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '1.75rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
              <AlertCircle size={44} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
                Benutzerkonto löschen?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Möchten Sie das Konto von <strong>{deleteTargetUser.first_name} {deleteTargetUser.last_name}</strong> ({deleteTargetUser.email}) wirklich unwiderruflich löschen?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
                <button
                  onClick={() => setDeleteTargetUser(null)}
                  className="btn btn-secondary"
                  disabled={isDeleting}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="btn btn-danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Wird gelöscht...' : 'Endgültig löschen'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
