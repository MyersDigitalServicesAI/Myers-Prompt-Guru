/**
 * Health Check Endpoint
 * 
 * Returns the health status of the application and its dependencies.
 * Useful for monitoring, load balancers, and uptime checks.
 */

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe-server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    firebase: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    stripe: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
  };
}

/**
 * Check Firebase connectivity
 */
async function checkFirebase(): Promise<{ status: 'up' | 'down'; latency?: number; error?: string }> {
  const start = Date.now();
  
  try {
    // Try to read from Firestore (lightweight operation)
    await db.collection('_health_check').limit(1).get();
    
    return {
      status: 'up',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Stripe API connectivity
 */
async function checkStripe(): Promise<{ status: 'up' | 'down'; latency?: number; error?: string }> {
  const start = Date.now();
  
  try {
    // Try to retrieve account info (lightweight operation)
    await stripe.accounts.retrieve();
    
    return {
      status: 'up',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * GET /api/health
 * 
 * Returns health status of the application
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  
  // Run health checks in parallel
  const [firebaseCheck, stripeCheck] = await Promise.all([
    checkFirebase(),
    checkStripe(),
  ]);

  // Determine overall status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  
  if (firebaseCheck.status === 'up' && stripeCheck.status === 'up') {
    overallStatus = 'healthy';
  } else if (firebaseCheck.status === 'down' && stripeCheck.status === 'down') {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp,
    version: process.env.npm_package_version || '0.1.0',
    checks: {
      firebase: firebaseCheck,
      stripe: stripeCheck,
    },
  };

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(result, { status: httpStatus });
}
