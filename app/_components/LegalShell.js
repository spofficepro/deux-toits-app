import Link from 'next/link';
import Footer from './Footer';

// Affiche une page légale à partir de données (titre, sections, paragraphes, listes).
export default function LegalShell({ title, updated, intro, sections }) {
  return (
    <main className="max-w-[720px] mx-auto px-6 py-14">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <svg viewBox="0 0 40 40" className="w-6 h-6" aria-hidden="true">
          <polygon points="20,4 36,20 4,20" fill="#2F5C55" />
          <rect x="10" y="20" width="20" height="14" rx="2" fill="#2F5C55" />
        </svg>
        <span className="font-serif text-lg font-semibold">Deux Toits</span>
      </Link>

      <h1 className="font-serif text-3xl mb-2">{title}</h1>
      <p className="text-xs text-inksoft mb-8">Dernière mise à jour : {updated}</p>

      <div className="card !p-8 space-y-7 text-sm leading-relaxed">
        {intro && <p className="text-inksoft">{intro}</p>}
        {sections.map(s => (
          <section key={s.title}>
            <h2 className="text-base font-semibold mb-2">{s.title}</h2>
            {(s.paras || []).map((p, i) => (
              <p key={i} className="mb-2 text-inksoft">{p}</p>
            ))}
            {s.list && (
              <ul className="list-disc pl-5 space-y-1 text-inksoft">
                {s.list.map((li, i) => <li key={i}>{li}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <Footer />
    </main>
  );
}
