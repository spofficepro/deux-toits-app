'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function JournalTab({ familyId, role }) {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });
    setEntries(data || []);
  }

  useEffect(() => {
    load();
    const channel = supabase
      .channel('journal_' + familyId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries', filter: `family_id=eq.${familyId}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [familyId]);

  async function publish() {
    if (!text.trim()) return;
 await supabase.from('journal_entries').insert({ family_id: familyId, author: role, content: text.trim() });
    setText('');
    load();
  }

  return (
      <div className="card !p-8">
      <h2 className="text-base font-semibold mb-5">Nouvelle note</h2>
      <div className="flex flex-col gap-2.5 mb-5">
        <textarea
          className="field min-h-[70px]"
          placeholder="Rendez-vous médical, information pour l'école, changement d'organisation…"
          value={text} onChange={e => setText(e.target.value)}
        />
        <button onClick={publish} className="btn self-start !px-4.5">Publier la note</button>
      </div>

      {entries.length === 0 && (
        <p className="text-center text-sm text-inksoft py-8">
          Aucune note pour l&apos;instant. Les notes sont horodatées et ne peuvent pas être modifiées après publication.
        </p>
      )}

      {entries.map(entry => (
        <div key={entry.id} className="py-3.5 border-b border-border last:border-none">
          <div className="text-xs text-inksoft mb-1">
            <strong className={entry.author === 'A' ? 'text-teal' : 'text-ochre'}>Toit {entry.author}</strong>
            {' · '}{new Date(entry.created_at).toLocaleDateString('fr-FR')} à {new Date(entry.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-sm leading-relaxed">{entry.content}</div>
        </div>
      ))}
    </div>
  );
}
