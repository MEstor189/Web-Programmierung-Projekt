import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import type { JobPosting } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { submitApplicationApi, registerCandidateApi, loginApi } from '../../services/api';

interface ApplicationModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ job, isOpen, onClose }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [earliestStartingDate, setEarliestStartingDate] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');
  const [dsgvoConsent, setDsgvoConsent] = useState(false);

  // File State & Drag-and-Drop
  interface UploadedFileItem {
    file: File;
    category: string;
  }

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // UI & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Guest-to-Account Conversion State (ADR 0003)
  const [accountPassword, setAccountPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountSuccessMsg, setAccountSuccessMsg] = useState<string | null>(null);
  const [accountErrorMsg, setAccountErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Missing fields validation calculation
  const isFirstNameValid = !!firstName.trim();
  const isLastNameValid = !!lastName.trim();
  const isEmailValid = !!email.trim() && email.includes('@');
  const isCvValid = uploadedFiles.length > 0;
  const isDsgvoValid = !!dsgvoConsent;

  const isFirstNameInvalid = (attemptedSubmit || !!touched.firstName) && !isFirstNameValid;
  const isLastNameInvalid = (attemptedSubmit || !!touched.lastName) && !isLastNameValid;
  const isEmailInvalid = (attemptedSubmit || !!touched.email) && !isEmailValid;
  const isCvInvalid = (attemptedSubmit || !!touched.cvFile) && !isCvValid;
  const isDsgvoInvalid = (attemptedSubmit || !!touched.dsgvoConsent) && !isDsgvoValid;

  const isFormComplete = isFirstNameValid && isLastNameValid && isEmailValid && isCvValid && isDsgvoValid;

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
    }
    if (isOpen) {
      setAttemptedSubmit(false);
      setTouched({});
      setFormError(null);
      setUploadedFiles([]);
    }
  }, [user, isOpen]);

  // Accessibility: Focus trap & Escape key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.txt', '.odt', '.rtf'];

  const detectDefaultCategory = (name: string, isFirst: boolean): string => {
    const lower = name.toLowerCase();
    if (lower.includes('cv') || lower.includes('lebenslauf') || lower.includes('resume')) return 'CV';
    if (lower.includes('anschreiben') || lower.includes('cover') || lower.includes('motivation')) return 'COVER_LETTER';
    if (lower.includes('zeugnis') || lower.includes('zertifikat') || lower.includes('certificate') || lower.includes('diplom')) return 'CERTIFICATE';
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) return 'PHOTO';
    if (lower.includes('portfolio') || lower.includes('arbeitsproben')) return 'PORTFOLIO';
    return isFirst ? 'CV' : 'ATTACHMENT';
  };

  // Validate and add multiple files
  const validateAndAddFiles = async (filesToAdd: FileList | File[]) => {
    setFileError(null);
    const valid: UploadedFileItem[] = [];

    for (let i = 0; i < filesToAdd.length; i++) {
      const file = filesToAdd[i];
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError(`Das Format von "${file.name}" wird nicht unterstützt. Erlaubt sind PDF, Word (DOCX/DOC), Bilder (PNG, JPG, WEBP) und Textdokumente.`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setFileError(`Die Datei "${file.name}" überschreitet das Limit von 10 MB.`);
        return;
      }

      if (ext === '.pdf') {
        try {
          const buffer = await file.slice(0, 5).arrayBuffer();
          const bytes = new Uint8Array(buffer);
          const headerString = String.fromCharCode(...bytes);
          if (!headerString.startsWith('%PDF-')) {
            setFileError(`Die Datei "${file.name}" ist kein valides PDF-Dokument (Header ungültig).`);
            return;
          }
        } catch {
          setFileError(`Dateilesefehler bei "${file.name}".`);
          return;
        }
      }

      const isFirst = uploadedFiles.length === 0 && valid.length === 0;
      valid.push({
        file,
        category: detectDefaultCategory(file.name, isFirst)
      });
    }

    setUploadedFiles((prev) => [...prev, ...valid]);
  };

  const updateFileCategory = (index: number, newCategory: string) => {
    setUploadedFiles((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, category: newCategory } : item))
    );
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setAttemptedSubmit(true);

    if (!isFormComplete) {
      if (!isFirstNameValid) {
        document.getElementById('first_name')?.focus();
      } else if (!isLastNameValid) {
        document.getElementById('last_name')?.focus();
      } else if (!isEmailValid) {
        document.getElementById('email')?.focus();
      } else if (!isCvValid) {
        fileInputRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('job_posting_id', job.id.toString());
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('email', email.trim());
      formData.append('dsgvo_consent', 'true');

      // Append primary file + type
      if (uploadedFiles.length > 0) {
        formData.append('cv_file', uploadedFiles[0].file);
        formData.append('cv_file_type', uploadedFiles[0].category);
      }
      // Append additional files + types
      for (let i = 1; i < uploadedFiles.length; i++) {
        formData.append('files', uploadedFiles[i].file);
        formData.append('file_types', uploadedFiles[i].category);
      }

      if (phone) formData.append('phone', phone.trim());
      if (expectedSalary) formData.append('expected_salary', expectedSalary);
      if (earliestStartingDate) formData.append('earliest_starting_date', earliestStartingDate);
      if (noticePeriod) formData.append('notice_period', noticePeriod.trim());
      if (githubUrl) formData.append('github_url', githubUrl.trim());
      if (linkedinUrl) formData.append('linkedin_url', linkedinUrl.trim());
      if (coverLetterText) formData.append('cover_letter_text', coverLetterText.trim());

      await submitApplicationApi(formData);
      setIsSubmittedSuccess(true);
    } catch (err: any) {
      console.error('Submission failed:', err);
      const detail = err.response?.data?.detail || 'Fehler beim Einreichen der Bewerbung. Bitte versuchen Sie es erneut.';
      setFormError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Guest to Candidate Account Conversion (ADR 0003)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountErrorMsg(null);

    if (!accountPassword || accountPassword.length < 6) {
      setAccountErrorMsg('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setIsCreatingAccount(true);

    try {
      // Register candidate account
      await registerCandidateApi({
        email: email.trim(),
        password: accountPassword,
        first_name: firstName.trim(),
        last_name: lastName.trim()
      });

      // Automatically log in newly created user
      const loginRes = await loginApi(email.trim(), accountPassword);
      await login(loginRes.access_token);

      setAccountSuccessMsg('Konto erfolgreich erstellt und Bewerbung automatisch verknüpft!');
    } catch (err: any) {
      console.error('Account creation error:', err);
      const detail = err.response?.data?.detail || 'Fehler bei der Erstellung des Kontos.';
      setAccountErrorMsg(detail);
    } finally {
      setIsCreatingAccount(false);
    }
  };

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
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-slate-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)'
        }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-brand-600)',
              display: 'block'
            }}>
              Online-Bewerbung
            </span>
            <h2 id="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: 0 }}>
              {job.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--color-slate-400)',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Schließen (ESC)"
            aria-label="Modal schließen"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {!isSubmittedSuccess ? (
            <form onSubmit={handleSubmit} id="modal-desc" noValidate>

              {formError && (
                <div role="alert" style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  fontSize: '0.875rem'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{formError}</div>
                </div>
              )}

              {/* Personal Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="first_name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: isFirstNameInvalid ? '#dc2626' : 'var(--color-slate-700)', marginBottom: '0.35rem' }}>
                    Vorname <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    required
                    value={firstName}
                    onBlur={() => setTouched((prev) => ({ ...prev, firstName: true }))}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="z.B. Anna"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: isFirstNameInvalid ? '1.5px solid #ef4444' : '1px solid var(--color-slate-300)',
                      backgroundColor: isFirstNameInvalid ? '#fef2f2' : '#ffffff',
                      boxShadow: isFirstNameInvalid ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                      fontSize: '0.875rem',
                      transition: 'all 0.15s ease'
                    }}
                  />
                  {isFirstNameInvalid && (
                    <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                      Bitte geben Sie Ihren Vornamen an.
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="last_name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: isLastNameInvalid ? '#dc2626' : 'var(--color-slate-700)', marginBottom: '0.35rem' }}>
                    Nachname <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    required
                    value={lastName}
                    onBlur={() => setTouched((prev) => ({ ...prev, lastName: true }))}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="z.B. Schmidt"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: isLastNameInvalid ? '1.5px solid #ef4444' : '1px solid var(--color-slate-300)',
                      backgroundColor: isLastNameInvalid ? '#fef2f2' : '#ffffff',
                      boxShadow: isLastNameInvalid ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                      fontSize: '0.875rem',
                      transition: 'all 0.15s ease'
                    }}
                  />
                  {isLastNameInvalid && (
                    <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                      Bitte geben Sie Ihren Nachnamen an.
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: isEmailInvalid ? '#dc2626' : 'var(--color-slate-700)', marginBottom: '0.35rem' }}>
                    E-Mail-Adresse <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anna.schmidt@example.de"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: isEmailInvalid ? '1.5px solid #ef4444' : '1px solid var(--color-slate-300)',
                      backgroundColor: isEmailInvalid ? '#fef2f2' : '#ffffff',
                      boxShadow: isEmailInvalid ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                      fontSize: '0.875rem',
                      transition: 'all 0.15s ease'
                    }}
                  />
                  {isEmailInvalid && (
                    <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                      Bitte geben Sie eine gültige E-Mail-Adresse an.
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '0.35rem' }}>
                    Telefonnummer (optional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Drag and Drop File Upload Area */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: isCvInvalid ? '#dc2626' : 'var(--color-slate-700)', margin: 0 }}>
                    Bewerbungsunterlagen (Lebenslauf, Anschreiben, Zeugnisse, Foto) <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  {uploadedFiles.length > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-brand-600)', fontWeight: 600 }}>
                      {uploadedFiles.length} Datei{uploadedFiles.length > 1 ? 'en' : ''} ausgewählt
                    </span>
                  )}
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: isDragging
                      ? '2px dashed var(--color-brand-600)'
                      : (isCvInvalid || fileError)
                      ? '2px dashed #ef4444'
                      : '2px dashed var(--color-slate-300)',
                    backgroundColor: isDragging
                      ? 'var(--color-brand-50)'
                      : (isCvInvalid || fileError)
                      ? '#fef2f2'
                      : '#f8fafc',
                    boxShadow: isCvInvalid ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: uploadedFiles.length === 0 ? '1.5rem 1rem' : '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.gif,.txt,.odt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />

                  {uploadedFiles.length === 0 ? (
                    <div>
                      <UploadCloud size={36} style={{ color: isDragging ? 'var(--color-brand-600)' : (isCvInvalid || fileError) ? '#ef4444' : 'var(--color-slate-400)', marginBottom: '0.5rem' }} />
                      <p style={{ margin: 0, fontWeight: 600, color: (isCvInvalid || fileError) ? '#b91c1c' : 'var(--color-slate-700)', fontSize: '0.9rem' }}>
                        Dateien hierher ziehen oder <span style={{ color: 'var(--color-brand-600)', textDecoration: 'underline' }}>Dateien auswählen</span>
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: (isCvInvalid || fileError) ? '#dc2626' : 'var(--color-slate-500)' }}>
                        PDF, DOCX, DOC, PNG, JPG, WEBP, TXT (mehrere Dateien möglich, max. 10 MB pro Datei)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {uploadedFiles.map((item, idx) => {
                          const { file, category } = item;
                          const isImage = file.type.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg|webp|gif)$/i);
                          return (
                            <div
                              key={idx}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#ffffff',
                                border: '1px solid var(--color-slate-200)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.55rem 0.75rem',
                                fontSize: '0.85rem',
                                gap: '0.75rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden', flex: 1 }}>
                                {isImage ? (
                                  <ImageIcon size={20} style={{ color: '#0284c7', flexShrink: 0 }} />
                                ) : (
                                  <FileText size={20} style={{ color: 'var(--color-brand-600)', flexShrink: 0 }} />
                                )}
                                <div style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--color-slate-900)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {file.name}
                                  </div>
                                  <div style={{ fontSize: '0.725rem', color: 'var(--color-slate-500)' }}>
                                    {formatFileSize(file.size)}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                <select
                                  value={category}
                                  onChange={(e) => updateFileCategory(idx, e.target.value)}
                                  className="input"
                                  style={{
                                    fontSize: '0.775rem',
                                    padding: '0.3rem 0.55rem',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid var(--color-slate-300)',
                                    fontWeight: 600,
                                    color: 'var(--color-slate-700)',
                                    cursor: 'pointer'
                                  }}
                                  title="Dokumentart festlegen"
                                >
                                  <option value="CV">Lebenslauf</option>
                                  <option value="COVER_LETTER">Anschreiben</option>
                                  <option value="CERTIFICATE">Zeugnis / Zertifikat</option>
                                  <option value="PHOTO">Foto / Bild</option>
                                  <option value="PORTFOLIO">Portfolio</option>
                                  <option value="ATTACHMENT">Sonstiger Anhang</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(idx);
                                  }}
                                  style={{
                                    border: 'none',
                                    background: '#f1f5f9',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--color-slate-500)',
                                    flexShrink: 0
                                  }}
                                  title="Datei entfernen"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: 'var(--color-brand-600)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Plus size={15} /> Weitere Dateien hinzufügen
                      </div>
                    </div>
                  )}
                </div>

                {isCvInvalid && !fileError && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                    Bitte laden Sie mindestens ein Bewerbungsdokument hoch.
                  </span>
                )}
                {fileError && (
                  <p role="alert" style={{ fontSize: '0.8rem', color: 'var(--color-danger)', marginTop: '0.35rem', margin: 0 }}>
                    {fileError}
                  </p>
                )}
              </div>

              {/* Additional Optional Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="salary" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '0.25rem' }}>
                    Gehaltswunsch (€/Jahr)
                  </label>
                  <input
                    id="salary"
                    type="number"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="z.B. 65000"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.825rem'
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="start_date" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '0.25rem' }}>
                    Frühestes Startdatum
                  </label>
                  <input
                    id="start_date"
                    type="date"
                    value={earliestStartingDate}
                    onChange={(e) => setEarliestStartingDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.825rem'
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="notice_period" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '0.25rem' }}>
                    Kündigungsfrist
                  </label>
                  <input
                    id="notice_period"
                    type="text"
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    placeholder="z.B. 3 Monate"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.825rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="github_url" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '0.25rem' }}>
                    GitHub Profil (optional)
                  </label>
                  <input
                    id="github_url"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.825rem'
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="linkedin_url" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '0.25rem' }}>
                    LinkedIn Profil (optional)
                  </label>
                  <input
                    id="linkedin_url"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-slate-300)',
                      fontSize: '0.825rem'
                    }}
                  />
                </div>
              </div>


              {/* Cover Letter / Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="cover_letter" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '0.35rem' }}>
                  Anschreiben / Kurzvorstellung (optional)
                </label>
                <textarea
                  id="cover_letter"
                  rows={3}
                  value={coverLetterText}
                  onChange={(e) => setCoverLetterText(e.target.value)}
                  placeholder="Warum passen Sie zu dieser Stelle bei TechCorp?..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-slate-300)',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* DSGVO Consent Checkbox */}
              <div style={{
                backgroundColor: isDsgvoInvalid ? '#fef2f2' : '#f8fafc',
                border: isDsgvoInvalid ? '1.5px solid #ef4444' : '1px solid var(--color-slate-200)',
                boxShadow: isDsgvoInvalid ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                transition: 'all 0.2s ease'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    required
                    checked={dsgvoConsent}
                    onChange={(e) => {
                      setDsgvoConsent(e.target.checked);
                      setTouched((prev) => ({ ...prev, dsgvoConsent: true }));
                    }}
                    style={{ marginTop: '3px', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.825rem', color: isDsgvoInvalid ? '#991b1b' : 'var(--color-slate-700)', lineHeight: 1.4 }}>
                    <strong>Datenschutz-Einwilligung (§ 26 BDSG / Art. 6 Abs. 1 lit. b DSGVO)</strong>:
                    Ich willige in die Verarbeitung meiner eingegebenen Daten und hochgeladenen Dokumente zur Bearbeitung meiner Bewerbung ein. Die Daten werden nach Abschluss des Auswahlverfahrens für maximal 180 Tage gespeichert und anschließend automatisch gelöscht.
                  </span>
                </label>
                {isDsgvoInvalid && (
                  <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.45rem', display: 'block', paddingLeft: '1.65rem' }}>
                    Die Bestätigung der Datenschutzerklärung ist zur Bewerbung erforderlich.
                  </span>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
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
                  style={{
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSubmitting ? (
                    <>Wird übermittelt...</>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Bewerbung jetzt einreichen
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* Success & Guest Account Conversion View (ADR 0003) */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: '0 0 0.5rem 0' }}>
                Vielen Dank für Ihre Bewerbung!
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--color-slate-600)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                Ihre Bewerbung als <strong>{job.title}</strong> ist erfolgreich bei TechCorp eingegangen. Unser Recruiter-Team wird Ihre Unterlagen sorgfältig prüfen.
              </p>

              {/* Hybrid Guest-to-Account Option if user is guest (ADR 0003) */}
              {!user ? (
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc, var(--color-brand-50))',
                  border: '1px solid var(--color-brand-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  textAlign: 'left',
                  marginTop: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-brand-700)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                    <ShieldCheck size={18} />
                    Möchten Sie den Status Ihrer Bewerbung online verfolgen?
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--color-slate-600)', margin: '0 0 1rem 0' }}>
                    Sie können jetzt mit nur einem Klick ein Bewerberkonto für <strong>{email}</strong> erstellen. Alle Ihre Bewerbungen werden automatisch mit Ihrem Profil verknüpft.
                  </p>

                  {accountSuccessMsg ? (
                    <div style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <UserCheck size={18} />
                      {accountSuccessMsg}
                    </div>
                  ) : (
                    <form onSubmit={handleCreateAccount} style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <input
                          type="password"
                          required
                          placeholder="Passwort festlegen (min. 6 Zeichen)"
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-slate-300)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isCreatingAccount}
                        className="btn btn-primary"
                        style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', gap: '0.35rem' }}
                      >
                        <Lock size={14} />
                        Konto jetzt aktivieren
                      </button>
                    </form>
                  )}

                  {accountErrorMsg && (
                    <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.5rem', margin: 0 }}>
                      {accountErrorMsg}
                    </p>
                  )}
                </div>
              ) : null}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Fenster schließen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/applicant/dashboard');
                  }}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  Zu meinen Bewerbungen
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
