'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import type { UserProfile, Prompt } from '@/lib/types';

const defaultPrompts: Omit<Prompt, 'id' | 'userId'>[] = [
    {
      title: 'Creative Story Starter',
      description: 'Generates a compelling opening line for a story based on a genre and a character.',
      template: 'Write the opening paragraph for a [genre] story featuring a [character_type] named [character_name].',
      category: 'Creative',
      tags: ['writing', 'fiction', 'storytelling'],
      isBookmarked: true,
    },
    {
      title: 'Marketing Email Copy',
      description: 'Crafts a persuasive marketing email for a new product launch.',
      template: 'Draft a marketing email to announce our new product, [product_name]. The target audience is [audience] and the key benefit is [benefit].',
      category: 'Marketing',
      tags: ['email', 'copywriting', 'sales'],
      isBookmarked: false,
    },
    {
      title: 'Technical Bug Report',
      description: 'Generates a clear and concise bug report for software development.',
      template: 'Create a bug report for an issue in the [app_feature] feature. The user action was "[user_action]", the expected result was "[expected_result]", and the actual result was "[actual_result]".',
      category: 'Technical',
      tags: ['development', 'debugging', 'qa'],
      isBookmarked: false,
    },
    {
      title: 'Social Media Post Idea',
      description: 'Generates a social media post for a specific platform and topic.',
      template: 'Come up with a [platform] post about [topic]. The desired tone is [tone] and it should include a call to action to "[cta]".',
      category: 'Marketing',
      tags: ['social media', 'content creation'],
      isBookmarked: true,
    },
      {
      title: 'Recipe Generator',
      description: 'Creates a simple recipe based on a main ingredient and a type of cuisine.',
      template: 'Generate a simple recipe for a [cuisine] dish where the main ingredient is [main_ingredient]. The recipe should take less than [time_minutes] minutes to prepare.',
      category: 'Lifestyle',
      tags: ['cooking', 'food', 'recipe'],
      isBookmarked: false,
    },
    {
      title: 'Code Explanation',
      description: 'Explains a piece of code in simple terms.',
      template: 'Explain the following [language] code snippet in plain English for a beginner: `[code_snippet]`',
      category: 'Technical',
      tags: ['code', 'programming', 'education'],
      isBookmarked: false,
    },
    {
      title: 'Personalized Workout Plan',
      description: 'Generates a workout plan based on user goals and preferences.',
      template: 'Create a 4-day workout plan for someone whose goal is [fitness_goal]. They have access to [equipment] and can work out for [duration] per session.',
      category: 'Health',
      tags: ['fitness', 'workout', 'health'],
      isBookmarked: false,
    },
    {
      title: 'Travel Itinerary',
      description: 'Creates a travel itinerary for a given destination and duration.',
      template: 'Plan a [duration_days]-day travel itinerary for a trip to [destination]. The traveler is interested in [interests] and has a budget of [budget].',
      category: 'Lifestyle',
      tags: ['travel', 'planning', 'itinerary'],
      isBookmarked: false,
    },
  ];

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth) { // If no Auth service instance, cannot determine user state
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null }); // Reset on auth instance change

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            // New user! Create their profile and seed their prompts.
            const newUserProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              isPro: false, // New users start as non-pro
            };
            await setDoc(userDocRef, newUserProfile);

            const promptsCollectionRef = collection(firestore, 'users', firebaseUser.uid, 'prompts');
            for (const prompt of defaultPrompts) {
              await addDoc(promptsCollectionRef, {
                ...prompt,
                userId: firebaseUser.uid,
              });
            }
          }
        }
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => { // Auth listener error
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe(); // Cleanup
  }, [auth, firestore]); // Depends on the auth and firestore instances

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { // Renamed from useAuthUser
  const { user, isUserLoading, userError } = useFirebase(); // Leverages the main hook
  return { user, isUserLoading, userError };
};
