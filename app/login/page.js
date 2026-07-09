'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function Login() {
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
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError('Email ou mot de passe incorrect.');
      return;
    }
    router.push('/app');
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-6">Se connecter</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email" required placeholder="ton@email.fr" className="field"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password" required placeholder="Mot de passe" className="field"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-red">{error}</p>}
        <button className="btn" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      <a href="/forgot-password" className="text-xs text-inksoft underline mt-4 inline-block">
        Mot de passe oublié ?
      </a>
    </main>
  );
}
