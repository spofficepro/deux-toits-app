'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import CalendarTab from './CalendarTab';
import ExpensesTab from './ExpensesTab';
import JournalTab from './JournalTab';

export default function App() {
  const [status, setStatus] = useState('loading'); // loading | blocked | ready
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

      setProfile(prof);
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
        <p className="text-sm text-inksoft mb-6">
          L&apos;essai gratuit ou l&apos;abonnement de ta famille n&apos;est plus actif.
        </p>
        <button onClick={() => router.push('/billing/start')} className="btn">Réactiver l&apos;abonnement</button>
      </main>
    );
  }

  return (
    <main className="max-w-[920px] mx-auto px-6 pb-20">
      <div className="flex justify-between items-center py-3 border-b border-border mb-6 text-sm text-inksoft">
        <div>
          Espace famille <strong className="text-ink">{family?.invite_code}</strong> · Tu es{' '}
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${profile.role === 'A' ? 'bg-teal-tint text-teal' : 'bg-ochre-tint text-ochre'}`}>
            Toit {profile.role}
          </span>
        </div>
        <div className="flex gap-4">
          <button onClick={openPortal} className="underline">Gérer l&apos;abonnement</button>
          <button onClick={logout} className="underline">Se déconnecter</button>
        </div>
      </div>

           <div className="flex gap-2 p-2 bg-white border border-border rounded-full w-fit mb-10">
        {[['calendar', 'Calendrier'], ['expenses', 'Dépenses'], ['journal', 'Journal'], ['export', 'Export']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-sm font-medium px-6 py-2.5 rounded-full transition-colors ${tab === key ? 'bg-ink text-bg' : 'text-inksoft hover:text-ink'}`}
          >{label}</button>
        ))}
      </div>

      {tab === 'calendar' && <CalendarTab familyId={profile.family_id} />}
      {tab === 'expenses' && <ExpensesTab familyId={profile.family_id} />}
      {tab === 'journal' && <JournalTab familyId={profile.family_id} role={profile.role} />}
    </main>
  );
}
