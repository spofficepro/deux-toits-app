'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function Onboarding() {
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [role, setRole] = useState(null);
  const [code, setCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const submitting = useRef(false);
  const router = useRouter();
  const supabase = createClient();

  const isViewerCode = code.trim().length === 8;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return; }
      setUser(data.user);
    });
  }, []);

  function startCreate() {
    setCreatedCode(generateCode());
    setRole(null);
    setMode('create');
  }

  function startJoin() {
    setRole(null);
    setMode('join');
  }

  async function confirmCreate() {
    if (!role || submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError('');

    // Si ce compte a déjà un espace famille (clic en double, retour arrière…), on ne recrée rien.
    const { data: existing } = await supabase
      .from('profiles')
      .select('family_id')
      .eq('id', user.id)
      .maybeSingle();
    if (existing?.family_id) {
      router.push('/billing/start');
      return;
    }

    // Création de la famille. Si le code est déjà pris (rare), on en génère un autre et on réessaie.
    const familyId = crypto.randomUUID();
    let codeToUse = createdCode;
    let famErr = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const { error } = await supabase
        .from('families')
        .insert({ id: familyId, invite_code: codeToUse });
      famErr = error;
      if (!error) break;
      if (error.code === '23505' || error.message.includes('families_invite_code_key')) {
        codeToUse = generateCode();
        setCreatedCode(codeToUse);
        continue;
      }
      break;
    }
    if (famErr) {
      setError('Impossible de créer l\'espace. Réessaie dans un instant.');
      setLoading(false);
      submitting.current = false;
      return;
    }

    const { error: profErr } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email, family_id: familyId, role });
    if (profErr) {
      setError(profErr.message);
      setLoading(false);
      submitting.current = false;
      return;
    }

    router.push('/billing/start');
  }

  async function confirmJoin() {
    if (!code.trim()) return;
    if (!isViewerCode && !role) return;
    setLoading(true);
    setError('');
    const { error: joinErr } = await supabase.rpc('join_family', {
      p_code: code,
      p_role: isViewerCode ? null : role
    });
    if (joinErr) {
      setError(
        joinErr.message.includes('Code introuvable')
          ? 'Code introuvable. Vérifie auprès de l\'autre parent.'
          : joinErr.message
      );
      setLoading(false);
      return;
    }
    router.push('/app');
  }

  return (
    <main className="max-w-[420px] mx-auto px-6 py-16">
      <div className="card">
        {!mode && (
          <>
            <h1 className="font-serif text-xl mb-2">Bienvenue</h1>
            <p className="text-sm text-inksoft mb-5 leading-relaxed">
              Crée un espace famille, ou rejoins celui déjà créé par l&apos;autre parent.
            </p>
            <div className="flex flex-col gap-2.5">
              <button onClick={startCreate} className="text-left p-3.5 rounded-[10px] border border-border hover:border-ink">
                <div className="font-semibold text-sm">Créer un espace famille</div>
                <div className="text-xs text-inksoft">Tu es le premier parent à t&apos;inscrire</div>
              </button>
              <button onClick={startJoin} className="text-left p-3.5 rounded-[10px] border border-border hover:border-ink">
                <div className="font-semibold text-sm">Rejoindre un espace existant</div>
                <div className="text-xs text-inksoft">Avec le code famille ou un code spectateur</div>
              </button>
            </div>
          </>
        )}

        {mode === 'create' && (
          <>
            <button onClick={() => setMode(null)} className="text-xs text-inksoft underline mb-4">← Retour</button>
            <h1 className="font-serif text-xl mb-2">Ton espace est prêt</h1>
            <p className="text-sm text-inksoft mb-4 leading-relaxed">
              Partage ce code avec l&apos;autre parent pour qu&apos;il ou elle rejoigne le même espace.
            </p>
            <div className="font-serif text-3xl tracking-widest text-center py-4 rounded-[10px] bg-teal-tint text-teal mb-4">
              {createdCode}
            </div>
            <RolePicker role={role} setRole={setRole} />
            {error && <p className="text-xs text-red mt-2">{error}</p>}
            <button onClick={confirmCreate} disabled={!role || loading} className="btn w-full mt-5">
              {loading ? 'Création…' : 'Entrer dans l\'espace'}
            </button>
          </>
        )}

        {mode === 'join' && (
          <>
            <button onClick={() => setMode(null)} className="text-xs text-inksoft underline mb-4">← Retour</button>
            <h1 className="font-serif text-xl mb-2">Rejoindre un espace</h1>
            <label className="text-xs font-semibold text-inksoft block mb-1.5 mt-2">Code</label>
            <input
              className="field uppercase tracking-widest" placeholder="Code famille ou code spectateur"
              value={code} onChange={e => setCode(e.target.value)}
            />
            {isViewerCode ? (
              <p className="text-xs text-inksoft mt-3">
                Code spectateur : tu rejoindras l&apos;espace en consultation seule, sans pouvoir rien modifier.
              </p>
            ) : (
              <>
                <label className="text-xs font-semibold text-inksoft block mb-1.5 mt-4">Tu es</label>
                <RolePicker role={role} setRole={setRole} />
              </>
            )}
            {error && <p className="text-xs text-red mt-2">{error}</p>}
            <button
              onClick={confirmJoin}
              disabled={!code.trim() || (!isViewerCode && !role) || loading}
              className="btn w-full mt-5"
            >
              {loading ? 'Connexion…' : 'Entrer dans l\'espace'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function RolePicker({ role, setRole }) {
  return (
    <div className="flex gap-2.5">
      <div
        onClick={() => setRole('A')}
        className={`flex-1 p-3 rounded-[10px] border text-center text-sm font-medium cursor-pointer ${role === 'A' ? 'border-teal bg-teal-tint text-teal' : 'border-border'}`}
      >Toit A</div>
      <div
        onClick={() => setRole('B')}
        className={`flex-1 p-3 rounded-[10px] border text-center text-sm font-medium cursor-pointer ${role === 'B' ? 'border-ochre bg-ochre-tint text-ochre' : 'border-border'}`}
      >Toit B</div>
    </div>
  );
}
