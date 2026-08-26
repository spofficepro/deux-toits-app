import Link from 'next/link';

export default function BillingSuccess() {
  return (
    <main className="max-w-[420px] mx-auto px-6 py-16 text-center">
      <h1 className="font-serif text-2xl mb-3">Ton essai gratuit a démarré</h1>
      <p className="text-sm text-inksoft mb-6">
        15 jours offerts, sans prélèvement immédiat. Tu peux inviter l&apos;autre parent avec ton code famille.
      </p>
      <Link href="/app" className="btn">Accéder à Deux Toits</Link>
    </main>
  );
}
