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
  if (!profile?.family_id) {
    return NextResponse.json({ error: 'Aucune famille associée.' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_collection: 'always',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    subscription_data: {
      trial_period_days: 15,
      metadata: { family_id: profile.family_id }
    },
    customer_email: user.email,
    metadata: { family_id: profile.family_id, user_id: user.id },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`
  });

  return NextResponse.json({ url: session.url });
}
