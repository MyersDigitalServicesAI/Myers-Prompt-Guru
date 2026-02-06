/**
 * Environment Variable Validation
 * 
 * Validates that all required environment variables are set at startup.
 * Fails fast with clear error messages if configuration is incomplete.
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

const ENV_VARS: EnvVar[] = [
  // Firebase Configuration
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    required: true,
    description: 'Firebase API key',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    required: true,
    description: 'Firebase auth domain',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    required: true,
    description: 'Firebase project ID',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    required: true,
    description: 'Firebase storage bucket',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    required: true,
    description: 'Firebase messaging sender ID',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    required: true,
    description: 'Firebase app ID',
  },
  
  // Gemini API
  {
    name: 'GEMINI_API_KEY',
    required: true,
    description: 'Google Gemini API key',
    validator: (value) => value.length > 20,
  },
  
  // Stripe Configuration
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret key',
    validator: (value) => value.startsWith('sk_'),
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    description: 'Stripe webhook secret',
    validator: (value) => value.startsWith('whsec_'),
  },
  {
    name: 'STRIPE_PRO_PRICE_ID',
    required: true,
    description: 'Stripe Pro subscription price ID',
    validator: (value) => value.startsWith('price_'),
  },
  
  // Optional Configuration
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    description: 'Stripe publishable key (optional, for client-side)',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'Application URL (defaults to localhost)',
  },
];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    // Check if required variable is missing
    if (envVar.required && !value) {
      errors.push(
        `Missing required environment variable: ${envVar.name}\n` +
        `  Description: ${envVar.description}\n` +
        `  Please set this variable in your .env file or deployment environment.`
      );
      continue;
    }

    // Skip validation if optional and not set
    if (!envVar.required && !value) {
      continue;
    }

    // Run custom validator if provided
    if (value && envVar.validator && !envVar.validator(value)) {
      errors.push(
        `Invalid value for environment variable: ${envVar.name}\n` +
        `  Description: ${envVar.description}\n` +
        `  Current value: ${value.substring(0, 10)}...\n` +
        `  Please check the format and try again.`
      );
    }
  }

  // Check for common misconfigurations
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey?.startsWith('sk_live_')) {
    warnings.push(
      'WARNING: Using Stripe LIVE keys. Make sure this is intentional.\n' +
      '  For development, use test keys (sk_test_...).'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate environment and throw if invalid
 * Call this at application startup
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironment();

  // Print warnings
  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment Warnings:\n');
    result.warnings.forEach(warning => console.warn(warning + '\n'));
  }

  // Throw if errors found
  if (!result.valid) {
    console.error('\n❌ Environment Validation Failed:\n');
    result.errors.forEach(error => console.error(error + '\n'));
    console.error(
      '\nPlease fix the above errors and restart the application.\n' +
      'See .env.example for reference.\n'
    );
    throw new Error('Environment validation failed');
  }

  console.log('✅ Environment validation passed\n');
}

/**
 * Get environment info for debugging (safe to log)
 */
export function getEnvironmentInfo(): Record<string, string> {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    firebaseProject: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not-set',
    stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not-set',
  };
}
