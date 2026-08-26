'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function ExportTab({ familyId }) {
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [from, setFrom] = useState(monthAgo.toISOString().slice(0, 10));
  const [to, setTo] = useState(today.toISOString().slice(0, 10));
  const [expenses, setExpenses] = useState(null);
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function generate() {
    setLoading(true);
    const fromISO = new Date(from + 'T00:00:00').toISOString();
    const toISO = new Date(to + 'T23:59:59').toISOString();

    const { data: exp } = await supabase
      .from('expenses')
      .select('*')
      .eq('family_id', familyId)
      .gte('created_at', fromISO)
      .lte('created_at', toISO)
      .order('created_at', { ascending: true });

    const { data: jour } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('family_id', familyId)
      .gte('created_at', fromISO)
      .lte('created_at', toISO)
      .order('created_at', { ascending: true });

    setExpenses(exp || []);
    setJournal(jour || []);
    setLoading(false);
  }

  function printIt() {
    window.print();
  }

  const totalA = (expenses || []).filter(e => e.payer === 'A').reduce((s, e) => s + Number(e.amount), 0);
  const totalB = (expenses || []).filter(e => e.payer === 'B').reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      <div className="card mb-6">
        <h2 className="text-base font-semibold mb-3.5">Exporter une période</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs font-semibold text-inksoft block mb-1.5">Du</label>
            <input type="date" className="field" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-inksoft block mb-1.5">Au</label>
            <input type="date" className="field" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button onClick={generate} className="btn" disabled={loading}>
            {loading ? 'Génération…' : 'Générer'}
          </button>
          {expenses !== null && (
            <button onClick={printIt} className="btn btn-ghost">Imprimer / Enregistrer en PDF</button>
          )}
        </div>
      </div>

      {expenses !== null && (
        <div id="print-area" className="card">
          <h1 className="font-serif text-2xl mb-1">Deux Toits — récapitulatif</h1>
          <p className="text-sm text-inksoft mb-6">Période du {from} au {to}</p>

          <h2 className="text-base font-semibold mb-3">Dépenses</h2>
          {expenses.length === 0 ? (
            <p className="text-sm text-inksoft mb-6">Aucune dépense sur cette période.</p>
          ) : (
            <>
              {expenses.map(exp => (
                <div key={exp.id} className="flex justify-between py-2 border-b border-border text-sm">
                  <span>{new Date(exp.created_at).toLocaleDateString('fr-FR')} — {exp.description}</span>
                  <span>Toit {exp.payer} · {Number(exp.amount).toFixed(2)} €</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 text-sm font-semibold">
                <span>Total Toit A : {totalA.toFixed(2)} €</span>
                <span>Total Toit B : {totalB.toFixed(2)} €</span>
              </div>
            </>
          )}

          <h2 className="text-base font-semibold mt-8 mb-3">Journal</h2>
          {journal.length === 0 ? (
            <p className="text-sm text-inksoft">Aucune note sur cette période.</p>
          ) : (
            journal.map(entry => (
              <div key={entry.id} className="py-3 border-b border-border">
                <div className="text-xs text-inksoft mb-1">
                  Toit {entry.author} · {new Date(entry.created_at).toLocaleDateString('fr-FR')} à {new Date(entry.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm">{entry.content}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}