'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function ExpensesTab({ familyId }) {
  const [expenses, setExpenses] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('A');
  const supabase = createClient();

  async function load() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });
    setExpenses(data || []);
  }

  useEffect(() => {
    load();
    const channel = supabase
      .channel('expenses_' + familyId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `family_id=eq.${familyId}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [familyId]);

  async function addExpense(e) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!desc.trim() || isNaN(value) || value <= 0) return;
await supabase.from('expenses').insert({ family_id: familyId, description: desc.trim(), amount: value, payer });
    setDesc(''); setAmount('');
    load();
  }

  async function remove(id) {
    await supabase.from('expenses').delete().eq('id', id);
    load();
  }

  const totalA = expenses.filter(e => e.payer === 'A').reduce((s, e) => s + Number(e.amount), 0);
  const totalB = expenses.filter(e => e.payer === 'B').reduce((s, e) => s + Number(e.amount), 0);
  const diff = totalA - totalB;
  const half = Math.abs(diff) / 2;

  return (
    <div>
            <div className="flex gap-4 mb-8">
        <div className="flex-1 card !p-4">
          <div className="text-xs text-inksoft mb-1.5">Payé par Toit A</div>
          <div className="font-serif text-xl">{totalA.toFixed(2)} €</div>
        </div>
        <div className="flex-1 card !p-4">
          <div className="text-xs text-inksoft mb-1.5">Payé par Toit B</div>
          <div className="font-serif text-xl">{totalB.toFixed(2)} €</div>
        </div>
        <div className="flex-1 card !p-4">
          <div className="text-xs text-inksoft mb-1.5">{Math.abs(diff) < 0.01 ? 'Solde' : diff > 0 ? 'Toit B doit à Toit A' : 'Toit A doit à Toit B'}</div>
          <div className={`font-serif text-xl ${Math.abs(diff) < 0.01 ? '' : diff > 0 ? 'text-teal' : 'text-red'}`}>
            {Math.abs(diff) < 0.01 ? 'équilibré' : half.toFixed(2) + ' €'}
          </div>
        </div>
      </div>

            <div className="card !p-8">
        <h2 className="text-base font-semibold mb-5">Ajouter une dépense</h2>
        <form onSubmit={addExpense} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2.5 mb-5">
          <input className="field" placeholder="Cantine, mutuelle, vêtements…" value={desc} onChange={e => setDesc(e.target.value)} required />
          <input className="field" type="number" step="0.01" min="0" placeholder="Montant €" value={amount} onChange={e => setAmount(e.target.value)} required />
          <select className="field" value={payer} onChange={e => setPayer(e.target.value)}>
            <option value="A">Payé par Toit A</option>
            <option value="B">Payé par Toit B</option>
          </select>
          <button className="btn !px-4.5">Ajouter</button>
        </form>

        {expenses.length === 0 && <p className="text-center text-sm text-inksoft py-8">Aucune dépense enregistrée pour l&apos;instant.</p>}

        {expenses.map(exp => (
          <div key={exp.id} className="flex justify-between items-center py-3 border-b border-border last:border-none text-sm">
            <div>
              <div className="font-medium">{exp.description}</div>
              <div className="text-xs text-inksoft">{new Date(exp.created_at).toLocaleDateString('fr-FR')}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${exp.payer === 'A' ? 'bg-teal-tint text-teal' : 'bg-ochre-tint text-ochre'}`}>
                Toit {exp.payer}
              </span>
              <strong>{Number(exp.amount).toFixed(2)} €</strong>
              <button onClick={() => remove(exp.id)} className="text-inksoft text-xs underline">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
