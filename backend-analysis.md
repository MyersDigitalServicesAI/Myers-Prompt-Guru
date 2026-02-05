# Backend Architecture Analysis - Myers Prompt Guru

## Current State

### Technology Stack
- **Frontend**: Next.js 15.5.9 with React 19, TypeScript
- **Backend**: Next.js API routes (currently minimal/missing)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google OAuth)
- **AI**: Google Gemini via Genkit
- **Payment**: Stripe (partial implementation)

### Existing Payment Implementation

#### Current Flow
1. User clicks "Upgrade to Pro" button
2. Hardcoded Stripe payment link: `https://buy.stripe.com/00w7sM0ob4h88Of1JqbQY0b`
3. User completes payment on Stripe-hosted page
4. No webhook handling for payment confirmation
5. Manual email-based pro status (hardcoded: `myersdigitalservicesai@gmail.com`)

#### Current Code Locations
- **Payment Dialog**: `src/components/app/go-pro-dialog.tsx` (hardcoded link)
- **User Type**: `src/lib/types.ts` (UserProfile with isPro boolean)
- **Auth Provider**: `src/firebase/provider.tsx` (email-based pro check)
- **Firestore Rules**: `firestore.rules` (user-ownership model)
- **Legacy Verification**: `promptmaster-library/api/verify-stripe.ts` (not integrated)

### Data Model

#### UserProfile (Firestore: `/users/{userId}`)
```typescript
{
  id: string;           // Firebase Auth UID
  email: string;        // User email
  isPro: boolean;       // Pro subscription status
  googleId?: string;    // Google OAuth ID
}
```

#### Missing Fields for Production Stripe
- `stripeCustomerId`: Link to Stripe customer
- `stripeSubscriptionId`: Active subscription ID
- `subscriptionStatus`: 'active' | 'canceled' | 'past_due' | 'trialing'
- `subscriptionEndDate`: Timestamp for expiration
- `stripePaymentIntentId`: For one-time payments

## Production Requirements

### 1. Stripe Product Architecture

**Recommended Approach**: Subscription-based billing
- **Product**: "Myers Prompt Guru Pro"
- **Price**: $5.00/month recurring
- **Features**: Unlimited saves, bulk import, OCR, AI Guru Chat

### 2. Backend API Routes Needed

#### `/api/stripe/create-checkout-session` (POST)
- Creates Stripe Checkout session
- Attaches Firebase UID as metadata
- Returns session URL for redirect

#### `/api/stripe/webhook` (POST)
- Handles Stripe webhook events
- Verifies webhook signature
- Updates Firestore user profile based on events:
  - `checkout.session.completed`: Set isPro = true
  - `customer.subscription.updated`: Update subscription status
  - `customer.subscription.deleted`: Set isPro = false
  - `invoice.payment_failed`: Handle payment failures

#### `/api/stripe/portal` (POST)
- Creates Stripe Customer Portal session
- Allows users to manage subscription, payment methods, invoices

#### `/api/stripe/subscription-status` (GET)
- Fetches current subscription status from Stripe
- Syncs with Firestore if out of sync

### 3. Environment Variables Required

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product/Price IDs
STRIPE_PRO_PRICE_ID=price_...
```

### 4. Security Considerations

#### Webhook Security
- Verify Stripe signature on all webhook requests
- Use raw body for signature verification
- Implement idempotency to handle duplicate events

#### API Route Protection
- Verify Firebase Auth token on protected routes
- Validate user owns the resource they're accessing
- Rate limit webhook endpoint

#### Firestore Rules Enhancement
- Add validation for stripeCustomerId (immutable after set)
- Ensure isPro can only be updated by backend (not client)

### 5. User Flow

#### New User Subscribing
1. User clicks "Upgrade to Pro"
2. Frontend calls `/api/stripe/create-checkout-session`
3. User redirected to Stripe Checkout
4. User completes payment
5. Stripe sends `checkout.session.completed` webhook
6. Backend updates Firestore: `isPro = true`, stores customer/subscription IDs
7. User redirected back to app with success message
8. Frontend refreshes user profile from Firestore

#### Existing Pro User Managing Subscription
1. User navigates to Profile/Settings
2. Clicks "Manage Subscription"
3. Frontend calls `/api/stripe/portal`
4. User redirected to Stripe Customer Portal
5. User cancels/updates subscription
6. Stripe sends webhook event
7. Backend updates Firestore accordingly
8. User redirected back to app

### 6. Testing Requirements

#### Test Mode
- Use Stripe test keys initially
- Test webhook events using Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)

#### Production Checklist
- [ ] Stripe account verified and activated
- [ ] Products and prices created in Stripe Dashboard
- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Environment variables set in Vercel/deployment platform
- [ ] Firestore rules updated and deployed
- [ ] Test subscription flow end-to-end
- [ ] Test webhook delivery and retries
- [ ] Test subscription cancellation flow
- [ ] Test payment failure handling
- [ ] Monitor Stripe logs for errors

## Implementation Priority

### Phase 1: Core Webhook Infrastructure
1. Create `/api/stripe/webhook` route
2. Implement signature verification
3. Handle `checkout.session.completed` event
4. Update Firestore user profile

### Phase 2: Checkout Session Creation
1. Create Stripe Product and Price in Dashboard
2. Create `/api/stripe/create-checkout-session` route
3. Update `go-pro-dialog.tsx` to use dynamic checkout
4. Add success/cancel redirect pages

### Phase 3: Subscription Management
1. Create `/api/stripe/portal` route
2. Add "Manage Subscription" button to profile page
3. Handle subscription lifecycle events in webhook

### Phase 4: Enhanced User Experience
1. Add subscription status display
2. Implement grace period for failed payments
3. Add email notifications (via Stripe)
4. Sync subscription status on app load

## Risks and Mitigations

### Risk: Webhook Delivery Failure
**Mitigation**: Implement subscription status check on user login, sync from Stripe if mismatch detected

### Risk: Race Condition (User Pays, Webhook Delayed)
**Mitigation**: Poll Stripe API after checkout redirect, don't rely solely on webhook

### Risk: User Manipulates Firestore isPro Field
**Mitigation**: Update Firestore rules to make isPro server-writable only, validate on backend API calls

### Risk: Duplicate Webhook Events
**Mitigation**: Use Stripe event ID as idempotency key, check if already processed before updating

## Next Steps

1. Review and approve architecture
2. Create Stripe product/price in Dashboard
3. Implement webhook endpoint with signature verification
4. Implement checkout session creation
5. Update frontend to use new API routes
6. Test end-to-end flow in test mode
7. Deploy and configure production webhooks
8. Monitor and iterate
