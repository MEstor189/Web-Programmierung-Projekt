import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Edit3,
  FileText,
  Trash2,
  Download,
  Plus,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import type { Application, ApplicationDocument, ApplicationUpdatePayload } from '../../types';
import {
  updateApplicationApi,
  getApplicationDetailApi,
  uploadApplicationDocumentApi,
  deleteApplicationDocumentApi,
  fetchDocumentBlob
} from '../../services/api';

interface ApplicationEditModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ApplicationEditModal: React.FC<ApplicationEditModalProps> = ({
  application,
  isOpen,
  onClose,
  onSaved
}) => {
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [earliestStartingDate, setEarliestStartingDate] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');

  // Documents state
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadCategory, setDocUploadCategory] = useState('ATTACHMENT');
  const [docActionSuccess, setDocActionSuccess] = useState<string | null>(null);
  const [docActionError, setDocActionError] = useState<string | null>(null);

  // General state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDetails = async (appId: number) => {
    setIsLoadingDocs(true);
    try {
      const detail = await getApplicationDetailApi(appId);
      setDocuments(detail.documents || []);
    } catch (err) {
      console.error('Failed to load application documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (application && isOpen) {
      setFirstName(application.first_name || '');
      setLastName(application.last_name || '');
      setPhone(application.phone || '');
      setExpectedSalary(application.expected_salary ? application.expected_salary.toString() : '');
      setEarliestStartingDate(application.earliest_starting_date || '');
      setNoticePeriod(application.notice_period || '');
      setGithubUrl(application.github_url || '');
      setLinkedinUrl(application.linkedin_url || '');
      setCoverLetterText(application.cover_letter_text || '');
      setError(null);
      setDocActionSuccess(null);
      setDocActionError(null);

      loadDetails(application.id);
    }
  }, [application, isOpen]);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const payload: ApplicationUpdatePayload = {
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        expected_salary: expectedSalary ? Number(expectedSalary) : undefined,
        earliest_starting_date: earliestStartingDate || undefined,
        notice_period: noticePeriod.trim() || undefined,
        github_url: githubUrl.trim() || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        cover_letter_text: coverLetterText.trim() || undefined,
      };

      await updateApplicationApi(application.id, payload);
      setIsSaving(false);
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to update application:', err);
      setError(err.response?.data?.detail || 'Fehler beim Speichern der Änderungen.');
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = '';

    setDocActionError(null);
    setDocActionSuccess(null);
    setIsUploadingDoc(true);

    try {
      const newDoc = await uploadApplicationDocumentApi(application.id, file, docUploadCategory);
      setDocuments((prev) => [...prev, newDoc]);
      setDocActionSuccess(`"${file.name}" wurde erfolgreich hinzugefügt.`);
      onSaved();
    } catch (err: any) {
      console.error('Failed to upload document:', err);
      setDocActionError(err.response?.data?.detail || 'Fehler beim Hochladen der Datei.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: number, docName: string) => {
    if (!window.confirm(`Möchten Sie das Dokument "${docName}" wirklich löschen?`)) {
      return;
    }

    setDocActionError(null);
    setDocActionSuccess(null);

    try {
      await deleteApplicationDocumentApi(application.id, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setDocActionSuccess(`"${docName}" wurde erfolgreich gelöscht.`);
      onSaved();
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      setDocActionError(err.response?.data?.detail || 'Fehler beim Löschen des Dokuments.');
    }
  };

  const handleDownloadDocument = async (doc: ApplicationDocument) => {
    try {
      const blob = await fetchDocumentBlob(application.id, doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_filename || 'Dokument';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download document:', err);
      window.open(`/api/v1/applications/${application.id}/documents/${doc.id}`, '_blank');
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocTypeBadge = (fileType: string) => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      CV: { label: 'Lebenslauf', bg: '#eff6ff', color: '#1d4ed8' },
      COVER_LETTER: { label: 'Anschreiben', bg: '#fdf2f8', color: '#be185d' },
      CERTIFICATE: { label: 'Zeugnis / Zertifikat', bg: '#fefce8', color: '#a16207' },
      PHOTO: { label: 'Foto / Bild', bg: '#f0fdf4', color: '#15803d' },
      PORTFOLIO: { label: 'Portfolio', bg: '#f5f3ff', color: '#6d28d9' },
      ATTACHMENT: { label: 'Anhang', bg: '#f1f5f9', color: '#475569' },
      OTHER: { label: 'Dokument', bg: '#f1f5f9', color: '#475569' },
    };
    const c = map[fileType] || { label: fileType, bg: '#f1f5f9', color: '#475569' };
    return (
      <span style={{
        display: 'inline-block',
        fontSize: '0.7rem',
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.color,
        padding: '0.15rem 0.45rem',
        borderRadius: '4px'
      }}>
        {c.label}
      </span>
    );
  };

  const jobTitle = application.job_posting_title || application.job_posting?.title || `Bewerbung #${application.id}`;

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
        overflowY: 'auto'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-slate-200)',
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
              <Edit3 size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-brand-600)', textTransform: 'uppercase' }}>
                Bewerbung bearbeiten & Unterlagen verwalten
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--color-slate-900)' }}>
                {jobTitle}
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

        {/* Body Form */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

          {/* Section 1: Uploaded Documents Management */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--color-slate-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                  Bewerbungsunterlagen ({documents.length})
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.775rem', color: 'var(--color-slate-500)' }}>
                  Lebenslauf, Anschreiben, Zeugnisse und Fotos ansehen, löschen oder ergänzen
                </p>
              </div>
            </div>

            {docActionSuccess && (
              <div style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <CheckCircle2 size={15} />
                <span>{docActionSuccess}</span>
              </div>
            )}

            {docActionError && (
              <div style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <AlertCircle size={15} />
                <span>{docActionError}</span>
              </div>
            )}

            {/* Document List */}
            {isLoadingDocs ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-slate-500)', fontSize: '0.85rem' }}>
                <Loader2 size={18} className="spin" style={{ display: 'inline', marginRight: '0.35rem' }} /> Unterlagen werden geladen...
              </div>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-slate-500)', fontSize: '0.85rem' }}>
                Noch keine Unterlagen hochgeladen.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {documents.map((doc) => {
                  const isImg = doc.mime_type?.startsWith('image/') || doc.original_filename?.match(/\.(png|jpg|jpeg|webp|gif)$/i);
                  return (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--color-slate-200)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                        {isImg ? (
                          <ImageIcon size={20} style={{ color: '#0284c7', flexShrink: 0 }} />
                        ) : (
                          <FileText size={20} style={{ color: 'var(--color-brand-600)', flexShrink: 0 }} />
                        )}
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>{doc.original_filename}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                            {getDocTypeBadge(doc.file_type)}
                            <span style={{ fontSize: '0.725rem', color: 'var(--color-slate-500)' }}>
                              {formatFileSize(doc.file_size_bytes)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                          title="Dokument ansehen / herunterladen"
                        >
                          <Download size={13} />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id, doc.original_filename)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca' }}
                          title="Dokument löschen"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Document Controls */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.65rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed var(--color-slate-300)'
            }}>
              <select
                value={docUploadCategory}
                onChange={(e) => setDocUploadCategory(e.target.value)}
                className="input"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem', maxWidth: '180px' }}
              >
                <option value="CV">Lebenslauf</option>
                <option value="COVER_LETTER">Anschreiben</option>
                <option value="CERTIFICATE">Zeugnis / Zertifikat</option>
                <option value="PHOTO">Foto / Bild</option>
                <option value="PORTFOLIO">Portfolio</option>
                <option value="ATTACHMENT">Sonstiger Anhang</option>
              </select>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.gif,.txt,.odt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingDoc}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', gap: '0.35rem' }}
              >
                {isUploadingDoc ? (
                  <>
                    <Loader2 size={14} className="spin" /> Hochladen...
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Neue Unterlage hinzufügen
                  </>
                )}
              </button>
              <span style={{ fontSize: '0.725rem', color: 'var(--color-slate-500)' }}>
                (PDF, DOCX, DOC, PNG, JPG, WEBP, TXT bis 10 MB)
              </span>
            </div>
          </div>

          {/* Section 2: Form Fields */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
              Kontaktdaten & Bewerbungsangaben
            </h3>

            {/* Personal Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                  Vorname <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  className="input"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Telefonnummer (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 170 1234567"
                className="input"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
              />
            </div>

            {/* Salary & Starting Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                  Gehaltsvorstellung (€ / Jahr)
                </label>
                <input
                  type="number"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="z.B. 65000"
                  className="input"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                  Frühestmögliches Startdatum
                </label>
                <input
                  type="date"
                  value={earliestStartingDate}
                  onChange={(e) => setEarliestStartingDate(e.target.value)}
                  className="input"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Kündigungsfrist / Verfügbarkeit
              </label>
              <input
                type="text"
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                placeholder="z.B. 3 Monate zum Monatsende, ab sofort..."
                className="input"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
              />
            </div>

            {/* Profile Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                  GitHub Profil URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="input"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                  LinkedIn Profil URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="input"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                Anschreiben / Mitteilung an das Recruiting-Team
              </label>
              <textarea
                rows={3}
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
                placeholder="Ergänzen oder aktualisieren Sie Ihre Nachricht..."
                className="input"
                style={{ width: '100%', padding: '0.65rem 0.75rem', fontSize: '0.875rem', resize: 'vertical' }}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-slate-200)',
              marginTop: '0.5rem'
            }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isSaving}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
                style={{ gap: '0.45rem' }}
              >
                <CheckCircle2 size={16} />
                {isSaving ? 'Speichere Änderungen...' : 'Änderungen speichern'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
