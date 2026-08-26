'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const DOW_FR = ['L','M','M','J','V','S','D'];

function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatDay(str) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

export default function CalendarTab({ familyId, role }) {
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [days, setDays] = useState({});
  const [swaps, setSwaps] = useState([]);
  const [confirmDay, setConfirmDay] = useState(null);
  const supabase = createClient();

  async function loadDays() {
    const { data } = await supabase.from('calendar_days').select('day, parent').eq('family_id', familyId);
    const map = {};
    (data || []).forEach(row => { map[row.day] = row.parent; });
    setDays(map);
  }

  async function loadSwaps() {
    const { data } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('family_id', familyId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setSwaps(data || []);
  }

  useEffect(() => {
    loadDays();
    loadSwaps();
    const ch1 = supabase
      .channel('calendar_days_' + familyId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_days', filter: `family_id=eq.${familyId}` }, loadDays)
      .subscribe();
    const ch2 = supabase
      .channel('swap_requests_' + familyId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'swap_requests', filter: `family_id=eq.${familyId}` }, loadSwaps)
      .subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, [familyId]);

  async function cycleDay(key) {
    const cur = days[key];
    const next = cur === undefined ? 'A' : cur === 'A' ? 'B' : undefined;
    setDays(prev => {
      const copy = { ...prev };
      if (next === undefined) delete copy[key]; else copy[key] = next;
      return copy;
    });
    if (next === undefined) {
      await supabase.from('calendar_days').delete().eq('family_id', familyId).eq('day', key);
    } else {
      await supabase.from('calendar_days').upsert({ family_id: familyId, day: key, parent: next });
    }
  }

  function onDayClick(key) {
    const val = days[key];
    if (!val) { cycleDay(key); return; }
    if (swaps.some(s => s.day === key)) return;
    setConfirmDay(key);
  }

  async function proposeSwap(key) {
    setConfirmDay(null);
    await supabase.from('swap_requests').insert({ family_id: familyId, day: key, requested_by: role });
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyId, actingRole: role, type: 'swap', summary: `échange du ${formatDay(key)}` })
    }).catch(() => {});
  }

  async function respondSwap(req, accept) {
    if (accept) {
      const current = days[req.day];
      const next = current === 'A' ? 'B' : 'A';
      await supabase.from('calendar_days').upsert({ family_id: familyId, day: req.day, parent: next });
      await supabase.from('swap_requests').update({ status: 'accepted' }).eq('id', req.id);
    } else {
      await supabase.from('swap_requests').update({ status: 'declined' }).eq('id', req.id);
    }
  }

  async function cancelSwap(id) {
    await supabase.from('swap_requests').update({ status: 'declined' }).eq('id', id);
  }

  const y = viewDate.getFullYear(), m = viewDate.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const myPending = swaps.filter(s => s.requested_by === role);
  const theirPending = swaps.filter(s => s.requested_by !== role);

  return (
    <div>
      {theirPending.length > 0 && (
        <div className="card !p-6 mb-6">
          <h2 className="text-base font-semibold mb-4">Demandes d&apos;échange reçues</h2>
          {theirPending.map(req => (
            <div key={req.id} className="flex justify-between items-center py-2 text-sm">
              <div>Toit {req.requested_by} propose d&apos;échanger le {formatDay(req.day)}</div>
              <div className="flex gap-3 items-center">
                <button onClick={() => respondSwap(req, true)} className="btn !py-1.5 !px-3.5 text-xs">Accepter</button>
                <button onClick={() => respondSwap(req, false)} className="text-xs underline text-inksoft">Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {myPending.length > 0 && (
        <div className="card !p-6 mb-6">
          <h2 className="text-base font-semibold mb-4">Tes demandes en attente</h2>
          {myPending.map(req => (
            <div key={req.id} className="flex justify-between items-center py-2 text-sm">
              <div>Échange proposé pour le {formatDay(req.day)}</div>
              <button onClick={() => cancelSwap(req.id)} className="text-xs underline text-inksoft">Annuler</button>
            </div>
          ))}
        </div>
      )}

      <div className="card !p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setViewDate(new Date(y, m - 1, 1))} className="w-8 h-8 rounded-full border border-border">‹</button>
            <h2 className="font-serif text-xl">{MONTHS_FR[m]} {y}</h2>
            <button onClick={() => setViewDate(new Date(y, m + 1, 1))} className="w-8 h-8 rounded-full border border-border">›</button>
          </div>
        </div>
        <div className="flex gap-4 mb-6 text-sm text-inksoft">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal inline-block" />Toit A</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-ochre inline-block" />Toit B</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {DOW_FR.map((d, i) => <div key={i} className="text-xs text-inksoft text-center pb-1">{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const key = dateKey(y, m, d);
            const val = days[key];
            const pending = swaps.some(s => s.day === key);
            const bg = val === 'A' ? 'bg-teal-tint border-teal' : val === 'B' ? 'bg-ochre-tint border-ochre' : 'bg-white border-border';
            return (
              <div
                key={i}
                onClick={() => onDayClick(key)}
                className={`relative aspect-[1/0.85] rounded-[10px] border cursor-pointer flex flex-col items-center justify-center text-[13px] gap-1 ${bg}`}
              >
                {pending && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-ink" />}
                <div className="font-medium">{d}</div>
                {val && <div className={`text-[10px] ${val === 'A' ? 'text-teal' : 'text-ochre'}`}>Toit {val}</div>}
              </div>
            );
          })}
        </div>
        <p className="text-sm text-inksoft mt-4">Clique sur un jour vide pour l&apos;attribuer. Clique sur un jour déjà attribué pour proposer un échange.</p>
      </div>

      {confirmDay && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setConfirmDay(null)}>
          <div className="card !p-6 max-w-[360px]" onClick={e => e.stopPropagation()}>
            <p className="text-sm mb-5">Proposer d&apos;échanger le {formatDay(confirmDay)} (actuellement Toit {days[confirmDay]}) ?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDay(null)} className="text-sm underline text-inksoft">Annuler</button>
              <button onClick={() => proposeSwap(confirmDay)} className="btn !py-2 !px-4 text-sm">Proposer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}