import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, MapPin, Clock, ArrowRight, Filter, RotateCcw, Briefcase, Building2, Loader2 } from 'lucide-react';
import { getJobs, getDepartments } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import type { JobPosting, Department, EmploymentType } from '../types';

export const HomePage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedEmpType, setSelectedEmpType] = useState<EmploymentType | undefined>(undefined);

  // Debounced Filter Values (300ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedLocation = useDebounce(selectedLocation, 300);

  // Track if this is the first load
  const isFirstMount = useRef(true);

  // Load Departments on Initial Render
  useEffect(() => {
    const loadDepts = async () => {
      try {
        const deptsData = await getDepartments();
        setDepartments(deptsData);
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    loadDepts();
  }, []);

  // Fetch Jobs when debounced filters change
  useEffect(() => {
    let isCurrent = true;

    const fetchJobs = async () => {
      if (!isFirstMount.current) {
        setIsFiltering(true);
      }
      try {
        const res = await getJobs({
          search: debouncedSearchTerm || undefined,
          department_id: selectedDeptId,
          location: debouncedLocation || undefined,
          employment_type: selectedEmpType,
          status: 'PUBLISHED',
          page_size: 50,
        });
        if (isCurrent) {
          setJobs(res.items);
          setTotalJobs(res.total);
        }
      } catch (err) {
        if (isCurrent) {
          console.error('Error fetching jobs:', err);
        }
      } finally {
        if (isCurrent) {
          setInitialLoading(false);
          setIsFiltering(false);
          isFirstMount.current = false;
        }
      }
    };

    fetchJobs();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearchTerm, selectedDeptId, debouncedLocation, selectedEmpType]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDeptId(undefined);
    setSelectedLocation('');
    setSelectedEmpType(undefined);
  };

  const hasActiveFilters = Boolean(searchTerm || selectedDeptId || selectedLocation || selectedEmpType);

  const formatEmploymentType = (type: EmploymentType): string => {
    const map: Record<EmploymentType, string> = {
      FULL_TIME: 'Vollzeit',
      PART_TIME: 'Teilzeit',
      WORKING_STUDENT: 'Werkstudent',
      CONTRACT: 'Contract / Freie Mitarbeit',
      INTERNSHIP: 'Praktikum',
    };
    return map[type] || type;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Neu';
    const d = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `Vor ${diffDays} Tagen`;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-slate-900) 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '4.5rem 0 4rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>

            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem', lineHeight: 1.15 }}>
              Gestalte Deine Zukunft bei <span style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>TechCorp Solutions</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--color-slate-300)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Finde Deinen Traumjob in Software Engineering, Cloud Infrastructure, UI/UX Design oder Data Science.
            </p>

            {/* Main Search & Filter Bar */}
            <div style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '0.85rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>

                {/* Search Text Input */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flex: '2 1 240px',
                  background: 'var(--color-slate-50)',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-slate-200)'
                }}>
                  <Search size={20} style={{ color: 'var(--color-slate-400)', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Stellentitel, Stichwort oder Technologie (z.B. React, Java)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '0.95rem',
                      background: 'transparent',
                      color: 'var(--color-slate-800)',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Location Filter Input */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flex: '1 1 180px',
                  background: 'var(--color-slate-50)',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-slate-200)'
                }}>
                  <MapPin size={18} style={{ color: 'var(--color-brand-600)', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Standort (z.B. Berlin, Remote)..."
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '0.95rem',
                      background: 'transparent',
                      color: 'var(--color-slate-800)',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

              </div>

              {/* Secondary Filter Dropdowns & Reset */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>

                {/* Department Select */}
                <div style={{ flex: '1 1 180px' }}>
                  <select
                    value={selectedDeptId || ''}
                    onChange={(e) => setSelectedDeptId(e.target.value ? Number(e.target.value) : undefined)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      border: '1px solid var(--color-slate-200)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-slate-50)',
                      fontSize: '0.9rem',
                      color: 'var(--color-slate-700)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="">Alle Fachbereiche</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employment Type Select */}
                <div style={{ flex: '1 1 180px' }}>
                  <select
                    value={selectedEmpType || ''}
                    onChange={(e) => setSelectedEmpType(e.target.value ? (e.target.value as EmploymentType) : undefined)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      border: '1px solid var(--color-slate-200)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-slate-50)',
                      fontSize: '0.9rem',
                      color: 'var(--color-slate-700)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="">Alle Anstellungsarten</option>
                    <option value="FULL_TIME">Vollzeit</option>
                    <option value="PART_TIME">Teilzeit</option>
                    <option value="WORKING_STUDENT">Werkstudent</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Praktikum</option>
                  </select>
                </div>

                {/* Reset Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="btn btn-secondary"
                    style={{ padding: '0.65rem 1rem', fontSize: '0.88rem', gap: '0.35rem' }}
                  >
                    <RotateCcw size={14} /> Filter zurücksetzen
                  </button>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Job Postings Grid */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-slate-50)', minHeight: '400px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--color-slate-900)', margin: 0 }}>Offene Stellenangebote</h2>
                {isFiltering && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-brand-600)', background: 'var(--color-brand-50)', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                    <Loader2 size={13} className="spinner" />
                    <span>Aktualisiere...</span>
                  </div>
                )}
              </div>
              <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
                {initialLoading ? (
                  'Stellen werden geladen...'
                ) : (
                  `${totalJobs} offene ${totalJobs === 1 ? 'Position' : 'Positionen'} gefunden`
                )}
              </p>
            </div>
          </div>

          {/* Initial Loading Spinner */}
          {initialLoading ? (
            <div style={{ padding: '4rem 0', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
              <p style={{ color: 'var(--color-slate-600)' }}>Lade Stellenanzeigen...</p>
            </div>
          ) : jobs.length === 0 ? (
            /* Empty State */
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <Filter size={48} style={{ color: 'var(--color-slate-300)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-slate-800)' }}>
                Keine passenden Stellenanzeigen gefunden
              </h3>
              <p style={{ color: 'var(--color-slate-600)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Versuche Deine Suchanfrage anzupassen oder wähle andere Filterkriterien.
              </p>
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className="btn btn-primary">
                  Filter zurücksetzen
                </button>
              )}
            </div>
          ) : (
            /* Job Grid with smooth opacity transition during filter debounce */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.5rem',
              opacity: isFiltering ? 0.65 : 1,
              transition: 'opacity 0.2s ease-in-out'
            }}>
              {jobs.map((job) => (
                <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.5rem' }}>
                      <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Building2 size={12} />
                        {job.department?.name || 'Fachbereich'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={13} /> {formatDate(job.published_at || job.created_at)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: 'var(--color-slate-900)', lineHeight: 1.35 }}>
                      {job.title}
                    </h3>

                    <p style={{
                      fontSize: '0.9rem',
                      color: 'var(--color-slate-600)',
                      marginBottom: '1.25rem',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {job.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-slate-600)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={15} style={{ color: 'var(--color-brand-600)' }} /> {job.location}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Briefcase size={15} style={{ color: 'var(--color-slate-400)' }} />
                        {formatEmploymentType(job.employment_type)}
                      </span>
                    </div>

                    <NavLink
                      to={`/jobs/${job.slug || job.id}`}
                      className="btn btn-outline"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Stellendetails & Bewerben <ArrowRight size={16} />
                    </NavLink>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
  );
};
