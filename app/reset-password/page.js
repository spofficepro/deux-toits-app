'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const started = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');

    // Nouvelle méthode : le jeton est dans l'adresse du lien (marche sur tout navigateur/appareil)
    if (tokenHash) {
      supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash }).then(({ error: verifyError }) => {
        if (verifyError) {
          setLinkError(true);
        } else {
          window.history.replaceState({}, '', '/reset-password');
          setReady(true);
        }
      });
      return;
    }

    // Ancienne méthode (anciens liens) : garde le comportement d'avant
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // Si rien ne se passe, on affiche une erreur au lieu de rester bloqué
    const timer = setTimeout(() => setLinkError(true), 8000);
    return () => {
      clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
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
      ) : ready ? (
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
      ) : linkError ? (
        <>
          <p className="text-sm text-inksoft mb-4">
            Ce lien est invalide ou expiré. Les liens ne fonctionnent qu&apos;une fois et pendant un temps limité.
          </p>
          <Link href="/forgot-password" className="btn inline-block">Demander un nouveau lien</Link>
        </>
      ) : (
        <p className="text-sm text-inksoft">Vérification du lien…</p>
      )}
    </main>
  );
}
