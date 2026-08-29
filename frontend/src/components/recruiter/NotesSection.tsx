import React, { useState } from 'react';
import {
  ShieldAlert,
  Star,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import type { ApplicationNote } from '../../types';
import { createApplicationNoteApi, deleteApplicationNoteApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface NotesSectionProps {
  applicationId: number;
  notes: ApplicationNote[];
  onNotesChanged: () => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  applicationId,
  notes,
  onNotesChanged,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [aggConfirmed, setAggConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!aggConfirmed) {
      setErrorMessage('Bitte bestätigen Sie die AGG-Konformität vor dem Absenden.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createApplicationNoteApi(applicationId, {
        content: content.trim(),
        rating: rating > 0 ? rating : undefined,
        agg_disclaimer_confirmed: aggConfirmed,
      });

      setContent('');
      setRating(0);
      setAggConfirmed(false);
      onNotesChanged();
    } catch (err: any) {
      console.error('Fehler beim Erstellen der Notiz:', err);
      setErrorMessage(
        err.response?.data?.detail || 'Die Notiz konnte nicht gespeichert werden.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!window.confirm('Möchten Sie diese Notiz wirklich löschen?')) {
      return;
    }

    try {
      await deleteApplicationNoteApi(applicationId, noteId);
      onNotesChanged();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Notiz konnte nicht gelöscht werden.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* AGG Compliance Disclaimer Banner */}
      <div
        style={{
          background: 'var(--color-brand-50, #eff6ff)',
          border: '1px solid var(--color-brand-200, #bfdbfe)',
          borderRadius: 'var(--radius-md, 8px)',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '0.85rem',
          alignItems: 'flex-start',
        }}
      >
        <ShieldAlert
          size={22}
          style={{ color: 'var(--color-brand-600, #2563eb)', flexShrink: 0, marginTop: '2px' }}
        />
        <div>
          <h4
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: 'var(--color-slate-900, #0f172a)',
              marginBottom: '0.25rem',
            }}
          >
            AGG-Compliance & Rechtssicherheit (§ 1 AGG)
          </h4>
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-slate-600, #475569)',
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            Interne Notizen und Beurteilungen müssen <strong>strikt sachbezogen, fachlich und diskriminierungsfrei</strong> formuliert sein. Bezugnahmen auf ethnische Herkunft, Geschlecht, Religion, Behinderung, Alter oder sexuelle Identität sind unzulässig.
          </p>
        </div>
      </div>

      {/* Note Creation Form */}
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{
          padding: '1.25rem',
          border: '1px solid var(--color-slate-200, #e2e8f0)',
          borderRadius: 'var(--radius-lg, 12px)',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--color-slate-800, #1e293b)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <MessageSquare size={16} />
            Fachliche Bewertung verfassen
          </label>

          {/* Rating Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', marginRight: '0.25rem' }}>
              Rating:
            </span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star === rating ? 0 : star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: (hoverRating || rating) >= star ? '#f59e0b' : 'var(--color-slate-300, #cbd5e1)',
                  transition: 'color 0.15s ease, transform 0.1s ease',
                  display: 'inline-flex',
                }}
                title={`${star} von 5 Sternen`}
              >
                <Star size={18} fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="form-input"
          rows={3}
          placeholder="Fachliche Einschätzung (z.B. Qualifikationen, GitHub-Code-Review, Gehaltseinschätzung, Intervieweindrücke)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            width: '100%',
            resize: 'vertical',
            fontSize: '0.88rem',
            lineHeight: 1.5,
          }}
        />

        {/* AGG Mandatory Confirmation Checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            cursor: 'pointer',
            padding: '0.65rem 0.85rem',
            background: aggConfirmed ? 'var(--color-success-bg, #f0fdf4)' : 'var(--color-slate-50, #f8fafc)',
            border: `1px solid ${aggConfirmed ? 'var(--color-success-border, #bbf7d0)' : 'var(--color-slate-200, #e2e8f0)'}`,
            borderRadius: 'var(--radius-md, 8px)',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="checkbox"
            checked={aggConfirmed}
            onChange={(e) => setAggConfirmed(e.target.checked)}
            style={{ marginTop: '3px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-700, #334155)', lineHeight: 1.4 }}>
            Ich bestätige die <strong>AGG-Konformität</strong> dieser Notiz (ausschließlich sachliche, fachbezogene Kriterien ohne Diskriminierungsmerkmale).
          </span>
        </label>

        {errorMessage && (
          <div
            style={{
              color: 'var(--color-danger, #ef4444)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <AlertTriangle size={15} />
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !content.trim() || !aggConfirmed}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              padding: '0.5rem 1.15rem',
            }}
          >
            <Send size={15} />
            {isSubmitting ? 'Wird gespeichert...' : 'Notiz speichern'}
          </button>
        </div>
      </form>

      {/* Notes List Feed */}
      <div>
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            color: 'var(--color-slate-800)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          Team-Bewertungen & Historie ({notes.length})
        </h4>

        {notes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              background: 'var(--color-slate-50, #f8fafc)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px dashed var(--color-slate-200, #e2e8f0)',
              color: 'var(--color-slate-500, #64748b)',
              fontSize: '0.88rem',
            }}
          >
            Noch keine internen Bewertungen vorhanden. Nutzen Sie das obige Formular für Ersteinschätzungen.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notes.map((note) => {
              const isAuthorOrAdmin =
                user && (user.id === note.user_id || user.role === 'ADMIN');
              const formattedDate = new Date(note.created_at).toLocaleString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={note.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--color-slate-200, #e2e8f0)',
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {/* Note Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--color-slate-900, #0f172a)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <User size={14} style={{ color: 'var(--color-brand-600)' }} />
                        {note.author_name || (note.author ? `${note.author.first_name} ${note.author.last_name}` : 'Team-Mitglied')}
                      </span>

                      <span
                        style={{
                          color: 'var(--color-slate-400)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Clock size={13} />
                        {formattedDate}
                      </span>

                      {note.agg_disclaimer_confirmed && (
                        <span
                          className="badge"
                          style={{
                            background: 'var(--color-success-bg, #f0fdf4)',
                            color: 'var(--color-success-text, #166534)',
                            fontSize: '0.72rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.15rem 0.45rem',
                          }}
                        >
                          <CheckCircle2 size={11} />
                          AGG-Konform
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {note.rating && note.rating > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            background: '#fef3c7',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#92400e',
                          }}
                        >
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          {note.rating}.0
                        </div>
                      )}

                      {isAuthorOrAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(note.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-slate-400)',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Notiz löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Note Content */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.88rem',
                      color: 'var(--color-slate-700, #334155)',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {note.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
