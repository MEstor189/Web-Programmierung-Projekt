import React from 'react';
import { Building2, Mail, Phone, MapPin, FileCheck, Scale, ShieldAlert } from 'lucide-react';

export const ImpressumPage: React.FC = () => {
  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: 'var(--color-slate-50)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <span className="badge badge-info" style={{ marginBottom: '0.75rem', padding: '0.35rem 0.85rem' }}>
            Rechtliche Hinweise (§ 5 DDG)
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '0.75rem' }}>
            Impressum
          </h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Gesetzliche Anbieterkennzeichnung und Pflichtangaben der TechCorp Solutions GmbH.
          </p>
        </div>

        {/* Company Overview Card */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--color-brand-50)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: 'var(--color-brand-600)' }}>
              <Building2 size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-slate-900)' }}>
                Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>Diensteanbieter & verantwortliche Stelle</span>
            </div>
          </div>

          <div style={{ lineHeight: 1.7, color: 'var(--color-slate-700)', fontSize: '0.95rem' }}>
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>TechCorp Solutions GmbH</strong></p>
            <p style={{ margin: '0 0 0.25rem 0' }}>Alexanderplatz 1</p>
            <p style={{ margin: '0 0 1rem 0' }}>10178 Berlin, Deutschland</p>

            <p style={{ margin: '0 0 0.25rem 0' }}><strong>Vertreten durch die Geschäftsführung:</strong></p>
            <p style={{ margin: '0 0 1rem 0' }}>Dr. Alex Richter, Sarah Connor</p>
          </div>
        </div>

        {/* Contact & Register Information */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--color-brand-50)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-brand-600)' }}>
                <Mail size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-slate-900)' }}>Kontakt</h3>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-slate-700)', lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ color: 'var(--color-slate-400)' }} />
                <span><strong>Telefon:</strong> +49 (0) 30 12345-670</span>
              </p>
              <p style={{ margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} style={{ color: 'var(--color-slate-400)' }} />
                <span><strong>E-Mail:</strong> info@techcorp.de</span>
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'var(--color-slate-400)' }} />
                <span><strong>Webseite:</strong> www.techcorp.de</span>
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--color-brand-50)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-brand-600)' }}>
                <FileCheck size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-slate-900)' }}>Register & Steuern</h3>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-slate-700)', lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                <strong>Registergericht:</strong> Amtsgericht Berlin-Charlottenburg
              </p>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                <strong>Registernummer:</strong> HRB 234567 B
              </p>
              <p style={{ margin: 0 }}>
                <strong>Umsatzsteuer-ID (§ 27a UStG):</strong> DE 345 678 901
              </p>
            </div>
          </div>
        </div>

        {/* Content Responsible & Dispute Resolution */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--color-brand-50)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: 'var(--color-brand-600)' }}>
              <Scale size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-slate-900)' }}>
                Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>Redaktionelle und journalistische Verantwortlichkeit</span>
            </div>
          </div>

          <p style={{ color: 'var(--color-slate-700)', margin: '0 0 1.5rem 0', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Dr. Alex Richter<br />
            Alexanderplatz 1<br />
            10178 Berlin, Deutschland
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-slate-200)', margin: '1.5rem 0' }} />

          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-slate-900)', marginBottom: '0.75rem' }}>
            Verbraucherstreitbeilegung / Universalschlichtungsstelle
          </h3>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand-600)', textDecoration: 'underline' }}>https://ec.europa.eu/consumers/odr</a> finden.
          </p>
        </div>

        {/* Disclaimer / Liability */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--color-brand-50)', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: 'var(--color-brand-600)' }}>
              <ShieldAlert size={24} />
            </div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-slate-900)' }}>
              Haftungsausschluss (Disclaimer)
            </h2>
          </div>

          <div style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong style={{ color: 'var(--color-slate-800)' }}>Haftung für Inhalte:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </div>
            <div>
              <strong style={{ color: 'var(--color-slate-800)' }}>Haftung für Links:</strong>
              <p style={{ margin: '0.25rem 0 0 0' }}>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
