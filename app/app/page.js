'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import CalendarTab from './CalendarTab';
import ExpensesTab from './ExpensesTab';
import JournalTab from './JournalTab';
import ExportTab from './ExportTab';
export default function App() {
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [family, setFamily] = useState(null);
  const [tab, setTab] = useState('calendar');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: prof } = await supabase
        .from('profiles')
        .select('*, families(invite_code)')
        .eq('id', user.id)
        .single();
      if (!prof?.family_id) { router.push('/onboarding'); return; }
      setProfile(prof);
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, trial_end')
        .eq('family_id', prof.family_id)
        .single();
      const active = sub && ['trialing', 'active'].includes(sub.status);
      if (!active) {
        setStatus('blocked');
        return;
      }
      setFamily(prof.families);
      setStatus('ready');
    })();
  }, []);

  async function openPortal() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (status === 'loading') {
    return <main className="max-w-[420px] mx-auto px-6 py-16 text-center text-sm text-inksoft">Chargement…</main>;
  }

  if (status === 'blocked') {
    return (
      <main className="max-w-[420px] mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-xl mb-3">Abonnement inactif</h1>
        {profile?.role === 'viewer' ? (
          <p className="text-sm text-inksoft">
            L&apos;abonnement de cette famille n&apos;est plus actif. Rapproche-toi de l&apos;un des parents.
          </p>
        ) : (
          <>
            <p className="text-sm text-inksoft mb-6">
              L&apos;essai gratuit ou l&apos;abonnement de ta famille n&apos;est plus actif.
            </p>
            <button onClick={() => router.push('/billing/start')} className="btn">Réactiver l&apos;abonnement</button>
          </>
        )}
      </main>
    );
  }

  const isViewer = profile.role === 'viewer';
  const badgeClass = profile.role === 'A'
    ? 'bg-teal-tint text-teal'
    : profile.role === 'B'
      ? 'bg-ochre-tint text-ochre'
      : 'bg-white border border-border text-inksoft';

  return (
    <main className="max-w-[920px] mx-auto px-6 pb-20">
      <div className="flex justify-between items-center py-3 border-b border-border mb-10 text-sm text-inksoft">
        <div>
          Espace famille <strong className="text-ink">{family?.invite_code}</strong> · Tu es{' '}
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
            {isViewer ? 'Spectateur' : `Toit ${profile.role}`}
          </span>
        </div>
        <div className="flex gap-4">
          {!isViewer && <button onClick={openPortal} className="underline">Gérer l&apos;abonnement</button>}
          <button onClick={logout} className="underline">Se déconnecter</button>
        </div>
      </div>
      {isViewer && (
        <p className="text-sm text-inksoft mb-6">Mode consultation : tu peux tout voir, mais rien modifier.</p>
      )}
      <div className="flex gap-2 p-2 bg-white border border-border rounded-full w-fit mb-10">
        {[['calendar', 'Calendrier'], ['expenses', 'Dépenses'], ['journal', 'Journal'], ['export', 'Export']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-sm font-medium px-6 py-2.5 rounded-full transition-colors ${tab === key ? 'bg-ink text-bg' : 'text-inksoft hover:text-ink'}`}
          >{label}</button>
        ))}
      </div>
      {tab === 'calendar' && <CalendarTab familyId={profile.family_id} role={profile.role} readOnly={isViewer} />}
      {tab === 'expenses' && <ExpensesTab familyId={profile.family_id} role={profile.role} readOnly={isViewer} />}
      {tab === 'journal' && <JournalTab familyId={profile.family_id} role={profile.role} readOnly={isViewer} />}
      {tab === 'export' && <ExportTab familyId={profile.family_id} />}
    </main>
  );
}
