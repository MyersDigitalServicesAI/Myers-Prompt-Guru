"use client";

import { useAuth } from "@/firebase";
import { useCallback } from "react";

/**
 * Hook for Pro feature access control on the client side
 */
export function useProFeatures() {
  const { userProfile, isUserLoading } = useAuth();

  const isPro = userProfile?.isPro ?? false;
  const subscriptionStatus = userProfile?.subscriptionStatus;
  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  /**
   * Check if user has access to Pro features
   */
  const hasProAccess = useCallback(() => {
    return isPro && isActive;
  }, [isPro, isActive]);

  /**
   * Get the reason why Pro access is denied (for user feedback)
   */
  const getAccessDeniedReason = useCallback(() => {
    if (!isPro) {
      return 'Pro subscription required';
    }
    if (!isActive) {
      if (subscriptionStatus === 'past_due') {
        return 'Payment failed. Please update your payment method.';
      }
      if (subscriptionStatus === 'canceled') {
        return 'Subscription canceled. Resubscribe to access Pro features.';
      }
      return 'Subscription inactive';
    }
    return null;
  }, [isPro, isActive, subscriptionStatus]);

  /**
   * Call a Pro-only API endpoint with authentication
   */
  const callProApi = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    if (!hasProAccess()) {
      throw new Error(getAccessDeniedReason() || 'Pro access required');
    }

    const { user } = useAuth.getState?.() || {};
    if (!user) {
      throw new Error('Not authenticated');
    }

    const idToken = await user.getIdToken();

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API call failed: ${response.status}`);
    }

    return response.json();
  }, [hasProAccess, getAccessDeniedReason]);

  return {
    isPro,
    isActive,
    hasProAccess: hasProAccess(),
    accessDeniedReason: getAccessDeniedReason(),
    subscriptionStatus,
    subscriptionEndDate: userProfile?.subscriptionEndDate,
    cancelAtPeriodEnd: userProfile?.cancelAtPeriodEnd,
    isLoading: isUserLoading,
    callProApi,
  };
}

/**
 * Higher-order component to protect Pro-only components
 */
export function withProFeature<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function ProFeatureWrapper(props: P) {
    const { hasProAccess, isLoading, accessDeniedReason } = useProFeatures();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!hasProAccess) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="text-center p-4 border rounded-lg">
          <p className="text-muted-foreground">{accessDeniedReason}</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
