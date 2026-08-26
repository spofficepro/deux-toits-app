'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/app'), 1500);
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-2">Nouveau mot de passe</h1>
      {done ? (
        <p className="text-sm text-inksoft">Mot de passe mis à jour, redirection…</p>
      ) : !ready ? (
        <p className="text-sm text-inksoft">Vérification du lien…</p>
      ) : (
        <>
          <p className="text-sm text-inksoft mb-6">Choisis ton nouveau mot de passe.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} required minLength={8} placeholder="Nouveau mot de passe" className="field w-full pr-16"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-inksoft underline"
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {error && <p className="text-xs text-red">{error}</p>}
            <button className="btn" disabled={loading}>
              {loading ? 'Mise à jour…' : 'Valider'}
            </button>
          </form>
        </>
      )}
    </main>
  );
}