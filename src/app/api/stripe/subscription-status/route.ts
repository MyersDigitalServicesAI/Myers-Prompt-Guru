import { NextRequest, NextResponse } from 'next/server';
import { stripe, getSubscriptionStatus } from '@/lib/stripe-server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const auth = getAuth();
const db = getFirestore();

/**
 * Get subscription status and sync with Firestore if needed
 * This is a fallback mechanism in case webhooks fail or are delayed
 */
export async function GET(req: NextRequest) {
  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Get user's data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
      return NextResponse.json({
        isPro: false,
        status: 'no_subscription',
      });
    }

    // Fetch subscription status from Stripe
    const subscriptionStatus = await getSubscriptionStatus(userData.stripeCustomerId);

    if (!subscriptionStatus) {
      // No active subscription in Stripe, update Firestore if needed
      if (userData.isPro) {
        await userDoc.ref.set({
          isPro: false,
          subscriptionStatus: 'canceled',
          updatedAt: new Date(),
        }, { merge: true });
      }

      return NextResponse.json({
        isPro: false,
        status: 'no_subscription',
      });
    }

    // Check if Firestore is out of sync with Stripe
    const isPro = subscriptionStatus.status === 'active' || subscriptionStatus.status === 'trialing';
    
    if (userData.isPro !== isPro || userData.subscriptionStatus !== subscriptionStatus.status) {
      // Sync Firestore with Stripe
      await userDoc.ref.set({
        isPro,
        stripeSubscriptionId: subscriptionStatus.id,
        subscriptionStatus: subscriptionStatus.status,
        subscriptionEndDate: subscriptionStatus.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptionStatus.cancelAtPeriodEnd,
        updatedAt: new Date(),
      }, { merge: true });

      console.log(`Synced subscription status for user ${userId}: isPro=${isPro}, status=${subscriptionStatus.status}`);
    }

    return NextResponse.json({
      isPro,
      status: subscriptionStatus.status,
      currentPeriodEnd: subscriptionStatus.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionStatus.cancelAtPeriodEnd,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
