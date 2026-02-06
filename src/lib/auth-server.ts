/**
 * Server-side authentication utilities for API routes
 */

import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import type { UserProfile } from './types';

// Initialize Firebase Admin (singleton pattern)
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const auth = getAuth();
const db = getFirestore();

export interface AuthContext {
  userId: string;
  email: string;
  userProfile: UserProfile | null;
}

/**
 * Verify Firebase Auth token from request headers
 * Returns user context or throws error
 */
export async function verifyAuthToken(req: NextRequest): Promise<AuthContext> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Fetch user profile from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userProfile = userDoc.exists ? (userDoc.data() as UserProfile) : null;

    return {
      userId: decodedToken.uid,
      email: decodedToken.email || '',
      userProfile,
    };
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

/**
 * Verify user has Pro subscription
 */
export async function verifyProUser(userId: string): Promise<boolean> {
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  return userData?.isPro === true;
}

/**
 * Check if user owns a resource
 */
export async function verifyResourceOwnership(
  userId: string,
  resourcePath: string
): Promise<boolean> {
  try {
    const resourceDoc = await db.doc(resourcePath).get();
    
    if (!resourceDoc.exists) {
      return false;
    }

    const resourceData = resourceDoc.data();
    return resourceData?.userId === userId;
  } catch (error) {
    console.error('Error verifying resource ownership:', error);
    return false;
  }
}

/**
 * Middleware wrapper for API routes requiring authentication
 */
export function withAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      const authContext = await verifyAuthToken(req);
      return await handler(req, authContext);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Authentication failed' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

/**
 * Middleware wrapper for API routes requiring Pro subscription
 */
export function withProAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      const authContext = await verifyAuthToken(req);
      
      if (!authContext.userProfile?.isPro) {
        return new Response(
          JSON.stringify({ 
            error: 'Pro subscription required',
            code: 'PRO_REQUIRED'
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return await handler(req, authContext);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Authentication failed' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

/**
 * Rate limiting helper (basic implementation)
 * In production, consider using a proper rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
