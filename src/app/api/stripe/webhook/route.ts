import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, verifyWebhookSignature } from '@/lib/stripe-server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
  // In production, use service account credentials
  // For now, we'll use the default credentials from the environment
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

// Disable body parsing, need raw body for signature verification
export const runtime = 'nodejs';

/**
 * Stripe Webhook Handler
 * Handles subscription lifecycle events and updates Firestore accordingly
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = verifyWebhookSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log(`Processing webhook event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook processing failed', eventId: event.id },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.firebaseUserId;
  
  if (!userId) {
    console.error('No firebaseUserId in checkout session metadata');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Update user profile in Firestore
  const userRef = db.collection('users').doc(userId);
  
  await userRef.set({
    isPro: true,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: 'active',
    updatedAt: new Date(),
  }, { merge: true });

  console.log(`User ${userId} upgraded to Pro (subscription: ${subscriptionId})`);
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find user by Stripe customer ID
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`No user found with stripeCustomerId: ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  const isPro = subscription.status === 'active' || subscription.status === 'trialing';

  await userDoc.ref.set({
    isPro,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionEndDate: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: new Date(),
  }, { merge: true });

  console.log(`Subscription ${subscription.id} updated for user ${userDoc.id}: status=${subscription.status}, isPro=${isPro}`);
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`No user found with stripeCustomerId: ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];

  await userDoc.ref.set({
    isPro: false,
    subscriptionStatus: 'canceled',
    cancelAtPeriodEnd: false,
    updatedAt: new Date(),
  }, { merge: true });

  console.log(`Subscription ${subscription.id} canceled for user ${userDoc.id}`);
}

/**
 * Handle successful invoice payment (renewal)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return; // Not a subscription invoice
  }

  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`No user found with stripeCustomerId: ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];

  await userDoc.ref.set({
    isPro: true,
    subscriptionStatus: 'active',
    updatedAt: new Date(),
  }, { merge: true });

  console.log(`Invoice payment succeeded for user ${userDoc.id}, subscription ${subscriptionId}`);
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`No user found with stripeCustomerId: ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];

  // Don't immediately revoke pro status - Stripe will retry
  // Only mark as past_due
  await userDoc.ref.set({
    subscriptionStatus: 'past_due',
    updatedAt: new Date(),
  }, { merge: true });

  console.log(`Invoice payment failed for user ${userDoc.id}, subscription ${subscriptionId}`);
}
