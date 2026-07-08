'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    router.push('/onboarding');
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-2">Créer ton compte</h1>
      <p className="text-sm text-inksoft mb-6">
        30 jours d&apos;essai gratuit. Une carte bancaire te sera demandée à l&apos;étape suivante
        pour activer l&apos;essai (aucun prélèvement avant la fin des 30 jours).
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email" required placeholder="ton@email.fr" className="field"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password" required placeholder="Mot de passe (8 caractères min.)" className="field"
          minLength={8} value={password} onChange={e => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-red">{error}</p>}
        <button className="btn" disabled={loading}>
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
    </main>
  );
}
