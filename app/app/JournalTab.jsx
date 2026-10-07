'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export default function JournalTab({ familyId, role, readOnly = false }) {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
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
    if (readOnly || saving) return;
    if (!text.trim()) return;
    setError('');

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Format non accepté : PDF, JPG, PNG ou WebP uniquement.');
        return;
      }
      if (file.size > MAX_SIZE) {
        setError('Fichier trop lourd (5 Mo maximum).');
        return;
      }
    }

    setSaving(true);
    let attachment = {};
    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${familyId}/${crypto.randomUUID()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from('attachments')
        .upload(path, file, { contentType: file.type });
      if (upErr) {
        setError('Envoi du fichier impossible : ' + upErr.message);
        setSaving(false);
        return;
      }
      attachment = { attachment_path: path, attachment_name: file.name };
    }

    const { error: insErr } = await supabase
      .from('journal_entries')
      .insert({ family_id: familyId, author: role, content: text.trim(), ...attachment });
    setSaving(false);
    if (insErr) { setError(insErr.message); return; }

    setText(''); setFile(null); setFileKey(k => k + 1);
    load();
  }

  async function openAttachment(path) {
    const w = window.open('', '_blank');
    const { data, error: urlErr } = await supabase.storage.from('attachments').createSignedUrl(path, 60);
    if (urlErr || !data?.signedUrl) {
      if (w) w.close();
      window.alert('Impossible d\'ouvrir le fichier.');
      return;
    }
    if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
  }

  return (
    <div className="card !p-8">
      {!readOnly && (
        <>
          <h2 className="text-base font-semibold mb-5">Nouvelle note</h2>
          <div className="flex flex-col gap-2.5 mb-5">
            <textarea
              className="field min-h-[70px]"
              placeholder="Rendez-vous médical, information pour l'école, changement d'organisation…"
              value={text} onChange={e => setText(e.target.value)}
            />
            <label className="text-xs text-inksoft">
              Pièce jointe (facultative, PDF ou image, 5 Mo max). À choisir maintenant : une note publiée ne peut plus être modifiée.{' '}
              <input
                key={fileKey}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </label>
            {error && <p className="text-xs text-red">{error}</p>}
            <button onClick={publish} disabled={saving} className="btn self-start !px-4.5">
              {saving ? 'Publication…' : 'Publier la note'}
            </button>
          </div>
        </>
      )}

      {readOnly && <h2 className="text-base font-semibold mb-5">Journal</h2>}

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
          {entry.attachment_path && (
            <button onClick={() => openAttachment(entry.attachment_path)} className="text-xs underline text-teal mt-1.5" title={entry.attachment_name}>
              Pièce jointe : {entry.attachment_name}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
