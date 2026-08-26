import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-[920px] mx-auto px-6 pb-20">
      <div className="grid md:grid-cols-2 gap-10 items-center py-14">
        <div>
          <div className="flex items-center gap-2 mb-7">
            <svg viewBox="0 0 40 40" className="w-7 h-7">
              <polygon points="20,4 36,20 4,20" fill="#2F5C55" />
              <rect x="10" y="20" width="20" height="14" rx="2" fill="#2F5C55" />
            </svg>
            <span className="font-serif text-lg font-semibold">Deux Toits</span>
          </div>
          <h1 className="font-serif text-4xl leading-tight mb-4">
            Un seul enfant. Deux maisons.<br />Un planning clair.
          </h1>
          <p className="text-inksoft leading-relaxed max-w-[46ch] mb-6">
            Le calendrier de garde, les dépenses partagées et les infos importantes
            de l&apos;enfant, réunis dans un seul espace neutre — pensé pour les
            parents séparés.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/signup" className="btn">Essai gratuit 15 jours</Link>
            <Link href="/login" className="btn btn-ghost">J&apos;ai déjà un compte</Link>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          {['a','a','a','b','b','b','b'].map((p, i) => (
            <div key={i} className="w-14 flex flex-col items-center">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '28px solid transparent',
                  borderRight: '28px solid transparent',
                  borderBottom: `30px solid ${p === 'a' ? '#2F5C55' : '#A8672B'}`
                }}
              />
              <div
                className="w-11 h-7 -mt-px rounded-b"
                style={{ background: p === 'a' ? '#2F5C55' : '#A8672B' }}
              />
              <span className="text-[11px] text-inksoft mt-1.5">
                {['L','M','M','J','V','S','D'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-baseline">
          <span className="font-serif text-2xl">
            15 jours gratuits<span className="text-sm text-inksoft"> puis 10 € / mois</span>
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-tint text-teal">
            Sans engagement
          </span>
        </div>
        <p className="text-sm text-inksoft mt-2">
          Un abonnement par foyer, partagé entre les deux parents. Résiliable à tout moment.
        </p>
      </div>
    </main>
  );
}
