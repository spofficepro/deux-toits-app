import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { createClient } from '../../../../lib/supabase/server';

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single();

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('family_id', profile.family_id)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'Aucun abonnement trouvé.' }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/app`
  });

  return NextResponse.json({ url: portalSession.url });
}
