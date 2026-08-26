'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const DOW_FR = ['L','M','M','J','V','S','D'];

function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarTab({ familyId }) {
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [days, setDays] = useState({});
  const supabase = createClient();

  useEffect(() => {
    let channel;
    (async () => {
      const { data } = await supabase.from('calendar_days').select('day, parent').eq('family_id', familyId);
      const map = {};
      (data || []).forEach(row => { map[row.day] = row.parent; });
      setDays(map);

      channel = supabase
        .channel('calendar_days_' + familyId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_days', filter: `family_id=eq.${familyId}` }, () => {
          supabase.from('calendar_days').select('day, parent').eq('family_id', familyId).then(({ data }) => {
            const map2 = {};
            (data || []).forEach(row => { map2[row.day] = row.parent; });
            setDays(map2);
          });
        })
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
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

  const y = viewDate.getFullYear(), m = viewDate.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
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
          const bg = val === 'A' ? 'bg-teal-tint border-teal' : val === 'B' ? 'bg-ochre-tint border-ochre' : 'bg-white border-border';
          return (
            <div
              key={i}
              onClick={() => cycleDay(key)}
              className={`aspect-[1/0.85] rounded-[10px] border cursor-pointer flex flex-col items-center justify-center text-[13px] gap-1 ${bg}`}
            >
              <div className="font-medium">{d}</div>
              {val && <div className={`text-[10px] ${val === 'A' ? 'text-teal' : 'text-ochre'}`}>Toit {val}</div>}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-inksoft mt-4">Clique sur un jour pour basculer entre Toit A, Toit B, et vide.</p>
    </div>
  );
}
