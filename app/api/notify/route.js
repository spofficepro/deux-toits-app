import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req) {
  const { familyId, actingRole, type, summary } = await req.json();

  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('family_id', familyId);

  const recipient = (profiles || []).find(p => p.role !== actingRole);
  if (!recipient) return NextResponse.json({ skipped: true });

  const label = type === 'expense' ? 'une nouvelle dépense' : 'une nouvelle note';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Deux Toits <onboarding@resend.dev>',
        to: recipient.email,
        subject: `Toit ${actingRole} a ajouté ${label}`,
        html: `<p>Toit ${actingRole} vient d'ajouter ${label} dans votre espace Deux Toits :</p><p><strong>${summary}</strong></p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/app">Ouvrir Deux Toits</a></p>`
      })
    });
  } catch (e) {
    console.error('Notify error', e);
  }

  return NextResponse.json({ sent: true });
}