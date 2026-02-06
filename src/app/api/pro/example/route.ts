/**
 * Example protected API route for Pro-only features
 * This demonstrates how to protect API endpoints that should only be accessible to Pro users
 */

import { NextRequest, NextResponse } from 'next/server';
import { withProAuth } from '@/lib/auth-server';

/**
 * Example Pro-only endpoint
 * This could be used for features like:
 * - Bulk import processing
 * - AI Guru Chat
 * - Advanced analytics
 * - OCR processing
 */
export const POST = withProAuth(async (req: NextRequest, context) => {
  try {
    // At this point, we know the user is authenticated and has Pro subscription
    const { userId, userProfile } = context;

    // Parse request body
    const body = await req.json();

    // Your Pro feature logic here
    // For example: process bulk import, run AI analysis, etc.

    return NextResponse.json({
      success: true,
      message: 'Pro feature executed successfully',
      userId,
      data: {
        // Your response data
      },
    });
  } catch (error) {
    console.error('Error in Pro feature:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute Pro feature',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

/**
 * Example GET endpoint for Pro users
 */
export const GET = withProAuth(async (req: NextRequest, context) => {
  const { userId, userProfile } = context;

  return NextResponse.json({
    message: 'Pro feature data',
    userId,
    subscriptionStatus: userProfile?.subscriptionStatus,
    // Your data here
  });
});
