'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl mb-2">Mot de passe oublié</h1>
      {sent ? (
        <p className="text-sm text-inksoft">
          Si un compte existe avec cet email, un lien de réinitialisation vient de t&apos;être envoyé. Pense à vérifier tes spams.
        </p>
      ) : (
        <>
          <p className="text-sm text-inksoft mb-6">
            Entre ton email, on t&apos;envoie un lien pour choisir un nouveau mot de passe.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email" required placeholder="ton@email.fr" className="field"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            {error && <p className="text-xs text-red">{error}</p>}
            <button className="btn" disabled={loading}>
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>
        </>
      )}
    </main>
  );
}