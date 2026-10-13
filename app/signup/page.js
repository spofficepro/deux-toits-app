'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    // Si l'email doit être confirmé, il n'y a pas encore de session : on l'explique clairement.
    if (data?.session) {
      router.push('/onboarding');
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <main className="max-w-[420px] mx-auto px-6 py-16">
        <div className="card">
          <h1 className="font-serif text-2xl mb-3">Vérifie ta boîte mail</h1>
          <p className="text-sm text-inksoft leading-relaxed mb-3">
            Nous avons envoyé un lien de confirmation à <strong>{email}</strong>.
            Clique dessus pour activer ton compte, puis reviens te connecter.
          </p>
          <p className="text-xs text-inksoft leading-relaxed mb-5">
            Tu ne le vois pas ? Regarde dans tes courriers indésirables (spam).
          </p>
          <Link href="/login" className="btn w-full text-center">Me connecter</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-2">Créer ton compte</h1>
      <p className="text-sm text-inksoft mb-6">
        15 jours d&apos;essai gratuit. Une carte bancaire te sera demandée à l&apos;étape suivante
        pour activer l&apos;essai (aucun prélèvement avant la fin des 15 jours).
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email" required placeholder="ton@email.fr" className="field"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'} required placeholder="Mot de passe (8 caractères min.)" className="field w-full pr-16"
            minLength={8} value={password} onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-inksoft underline"
          >
            {showPassword ? 'Masquer' : 'Afficher'}
          </button>
        </div>
        <label className="flex items-start gap-2 text-xs text-inksoft leading-relaxed">
          <input
            type="checkbox" required className="mt-0.5"
            checked={accepted} onChange={e => setAccepted(e.target.checked)}
          />
          <span>
            J&apos;accepte les{' '}
            <Link href="/cgu" target="_blank" className="underline">conditions générales</Link>
            {' '}et la{' '}
            <Link href="/confidentialite" target="_blank" className="underline">politique de confidentialité</Link>.
          </span>
        </label>
        {error && <p className="text-xs text-red">{error}</p>}
        <button className="btn" disabled={loading}>
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
    </main>
  );
}