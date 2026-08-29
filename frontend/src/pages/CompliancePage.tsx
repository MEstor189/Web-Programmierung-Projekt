import React from 'react';
import { Shield, Lock, Accessibility, CheckCircle2 } from 'lucide-react';


export const CompliancePage: React.FC = () => {
  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>Compliance & Legal Transparenz Hub</h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
            Die TechCorp Solutions GmbH steht für höchste Standards bei Datenschutz (DSGVO), Chancengleichheit (AGG) und digitale Barrierefreiheit (BFSG / WCAG 2.1 AA).
          </p>
        </div>

        {/* Section 1: DSGVO & Löschkonzept */}
        <div id="dsgvo" className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--color-brand-50)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: 'var(--color-brand-600)' }}>
              <Lock size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>1. Datenschutz & Anonymisierungskonzept (DSGVO / BDSG)</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>Gemäß Art. 6 Abs. 1 lit. b DSGVO & § 26 BDSG</span>
            </div>
          </div>

          <p style={{ color: 'var(--color-slate-700)', marginBottom: '1rem', lineHeight: 1.6 }}>
            Ihre personenbezogenen Daten (Name, E-Mail, Telefonnummer, Lebenslauf) werden ausschließlich zur Abwicklung des konkreten Bewerbungsverfahrens verarbeitet. 
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.95rem' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-success-text)', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Aufbewahrungsfrist:</strong> Nach Beendigung des Bewerbungsverfahrens (Absage) werden Ihre Daten für genau <strong>180 Tage (6 Monate)</strong> aufbewahrt, um rechtliche Fristen (§ 21 Abs. 5 AGG) einzuhalten.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.95rem' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-success-text)', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Automatisierte Anonymisierung:</strong> Nach Ablauf der 180 Tage ersetzt unser System Ihren Namen und Ihre Kontaktdaten durch Pseudonyme. Hochgeladene PDF-Dokumente werden physikalisch gelöscht. Aggregierte anonyme Statistiken bleiben erhalten.</span>
            </li>
          </ul>
        </div>

        {/* Section 2: AGG & Chancengleichheit */}
        <div id="agg" className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--color-brand-50)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: 'var(--color-brand-600)' }}>
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>2. Allgemeines Gleichbehandlungsgesetz (AGG)</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>Chancengleichheit & Antidiskriminierung</span>
            </div>
          </div>

          <p style={{ color: 'var(--color-slate-700)', marginBottom: '1rem', lineHeight: 1.6 }}>
            Bei der TechCorp Solutions GmbH bewerten wir Bewerbungen ausschließlich nach Qualifikation, Kompetenz und Eignung. Wir schließen jegliche Benachteiligung aus Gründen der Rasse, der ethnischen Herkunft, des Geschlechts, der Religion oder Weltanschauung, einer Behinderung, des Alters oder der sexuellen Identität aus.
          </p>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>
            Unfaire Vermerke oder unsachliche Kriterien sind im internen Recruiter-Notizsystem technisch ausgeschlossen und durch obligatorische Hinweis-Disclaimer abgesichert.
          </p>
        </div>

        {/* Section 3: Barrierefreiheit BFSG / WCAG */}
        <div id="bfsg" className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--color-brand-50)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: 'var(--color-brand-600)' }}>
              <Accessibility size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>3. Digitale Barrierefreiheit (WCAG 2.1 AA)</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>Konform zum Barrierefreiheitsstärkungsgesetz (BFSG)</span>
            </div>
          </div>

          <p style={{ color: 'var(--color-slate-700)', marginBottom: '1rem', lineHeight: 1.6 }}>
            Unsere Karriereseite und das Bewerbungsformular wurden von Grund auf barrierefrei gestaltet:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
              <strong>Tastatur-Navigation</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginTop: '0.25rem' }}>Alle Formulare und Buttons sind ohne Maus per Tab-Taste bedienbar (mit deutlichen Fokus-Ringen).</p>
            </div>

            <div style={{ background: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
              <strong>Screenreader Support</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-600)', marginTop: '0.25rem' }}>Verwendung von semantischem HTML5 und ARIA-Labels für sehbeeinträchtigte Personen.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
