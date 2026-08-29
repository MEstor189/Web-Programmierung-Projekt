import React, { useEffect, useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Building2,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Zap,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import { getJobByIdOrSlug } from '../services/api';
import type { JobPosting, EmploymentType } from '../types';
import { ApplicationModal } from '../components/jobs/ApplicationModal';

export const JobDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);


  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!idOrSlug) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getJobByIdOrSlug(idOrSlug);
        setJob(data);
      } catch (err: any) {
        console.error('Error loading job details:', err);
        setError(err?.response?.data?.detail || 'Stellenanzeige konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [idOrSlug]);

  const formatEmploymentType = (type: EmploymentType): string => {
    const map: Record<EmploymentType, string> = {
      FULL_TIME: 'Vollzeit',
      PART_TIME: 'Teilzeit',
      WORKING_STUDENT: 'Werkstudent',
      CONTRACT: 'Freie Mitarbeit / Contract',
      INTERNSHIP: 'Praktikum',
    };
    return map[type] || type;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unbekannt';
    const d = new Date(dateString);
    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyClick = () => {
    setIsApplyModalOpen(true);
  };


  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '1.1rem' }}>Lade Stellenanzeige...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container" style={{ padding: '5rem 0' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-rose-500)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.75rem', color: 'var(--color-slate-900)' }}>Stelle nicht gefunden</h2>
          <p style={{ color: 'var(--color-slate-600)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            {error || 'Die angeforderte Stellenausschreibung existiert nicht oder ist nicht mehr veröffentlich.'}
          </p>
          <NavLink to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Zurück zur Stellenübersicht
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-slate-50)', minHeight: 'calc(100vh - 140px)', paddingBottom: '4rem' }}>
      
      {/* Header Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-slate-900) 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '3rem 0 3.5rem 0',
      }}>
        <div className="container">
          {/* Breadcrumb Navigation */}
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-slate-300)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              padding: 0,
            }}
          >
            <ArrowLeft size={16} /> Zurück zur Stellenübersicht
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
              <Building2 size={13} style={{ marginRight: '0.35rem', display: 'inline-block', verticalAlign: 'middle' }} />
              {job.department?.name || 'Fachbereich'}
            </span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}>
              Ref-Code: #{job.id}
            </span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem', lineHeight: 1.2 }}>
            {job.title}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--color-slate-300)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} style={{ color: '#818cf8' }} />
              {job.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Briefcase size={18} style={{ color: '#818cf8' }} />
              {formatEmploymentType(job.employment_type)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} style={{ color: '#818cf8' }} />
              Veröffentlicht am {formatDate(job.published_at || job.created_at)}
            </span>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2rem' }}>
          
          {/* Main Details Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Description Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{
                  background: 'var(--color-brand-50)',
                  color: 'var(--color-brand-600)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <FileText size={22} />
                </div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--color-slate-900)', margin: 0 }}>
                  Über die Position & Deine Aufgaben
                </h2>
              </div>
              <div style={{
                color: 'var(--color-slate-700)',
                lineHeight: 1.7,
                fontSize: '1rem',
                whiteSpace: 'pre-line'
              }}>
                {job.description}
              </div>
            </div>

            {/* Requirements Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{
                  background: 'var(--color-brand-50)',
                  color: 'var(--color-brand-600)',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <CheckCircle2 size={22} />
                </div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--color-slate-900)', margin: 0 }}>
                  Das bringst Du mit (Anforderungsprofil)
                </h2>
              </div>
              <div style={{
                color: 'var(--color-slate-700)',
                lineHeight: 1.7,
                fontSize: '1rem',
                whiteSpace: 'pre-line'
              }}>
                {job.requirements}
              </div>
            </div>

            {/* Benefits Card (If present) */}
            {job.benefits && (
              <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--color-brand-600)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    background: '#f0fdf4',
                    color: '#16a34a',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <Sparkles size={22} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--color-slate-900)', margin: 0 }}>
                    Was wir Dir bieten (Benefits)
                  </h2>
                </div>
                <div style={{
                  color: 'var(--color-slate-700)',
                  lineHeight: 1.7,
                  fontSize: '1rem',
                  whiteSpace: 'pre-line'
                }}>
                  {job.benefits}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Panel */}
          <div>
            <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Primary Action Card */}
              <div className="card" style={{ padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--color-slate-900)' }}>
                  Interesse geweckt?
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-600)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Bewirb Dich in unter 2 Minuten ganz ohne Anschreiben-Zwang.
                </p>

                <button
                  onClick={handleApplyClick}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    fontSize: '1rem',
                    justifyContent: 'center',
                    fontWeight: 600,
                    marginBottom: '1rem'
                  }}
                >
                  <Zap size={18} /> Jetzt online bewerben
                </button>

                <button
                  onClick={handleCopyLink}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    justifyContent: 'center'
                  }}
                >
                  <Share2 size={15} /> {copied ? 'Link kopiert!' : 'Stelle teilen'}
                </button>

                {/* Transparency badges */}
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--color-slate-200)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.82rem',
                  color: 'var(--color-slate-600)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span>100% DSGVO-konform (§ 26 BDSG)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-brand-600)', flexShrink: 0 }} />
                    <span>Keine Registrierung erforderlich</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} style={{ color: 'var(--color-slate-400)', flexShrink: 0 }} />
                    <span>Direkte Bearbeitung durch HR</span>
                  </div>
                </div>
              </div>

              {/* Job Metadata Summary Card */}
              <div className="card" style={{ padding: '1.5rem', background: '#ffffff' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Eckdaten der Stelle
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-slate-500)' }}>Fachbereich:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>{job.department?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-slate-500)' }}>Anstellung:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>{formatEmploymentType(job.employment_type)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-slate-500)' }}>Standort:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-slate-800)' }}>{job.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-slate-500)' }}>URL-Slug:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-slate-600)' }}>{job.slug}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {job && (
        <ApplicationModal
          job={job}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}
    </div>
  );
};

