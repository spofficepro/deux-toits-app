import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { createAdminClient } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Signature invalide: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const familyId = session.metadata?.family_id;
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    if (familyId && subscriptionId) {
      // Récupère la carte utilisée pour vérifier si elle a déjà servi à un essai
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['default_payment_method']
      });
      const fingerprint = subscription.default_payment_method?.card?.fingerprint;

      let status = subscription.status;
      let trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;

      if (fingerprint) {
        const { data: existing } = await supabase
          .from('used_trial_fingerprints')
          .select('fingerprint')
          .eq('fingerprint', fingerprint)
          .maybeSingle();

        if (existing) {
          // Cette carte a déjà servi à un essai gratuit : on écourte l'essai immédiatement
          const updated = await stripe.subscriptions.update(subscriptionId, { trial_end: 'now' });
          status = updated.status;
          trialEnd = null;
        } else {
          await supabase.from('used_trial_fingerprints').insert({ fingerprint, family_id: familyId });
        }
      }

      await supabase.from('subscriptions').upsert({
        family_id: familyId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status,
        trial_end: trialEnd,
        updated_at: new Date().toISOString()
      });
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  return NextResponse.json({ received: true });
}
