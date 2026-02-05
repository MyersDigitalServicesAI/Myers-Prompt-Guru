# Stripe Integration Setup Instructions

## 1. Install Required Dependencies

Run the following command to install Stripe and Firebase Admin SDK:

```bash
npm install stripe firebase-admin
```

Or if using pnpm:

```bash
pnpm add stripe firebase-admin
```

## 2. Update Environment Variables

Copy the new `.env.example.new` to `.env` and fill in the values:

```bash
cp .env.example.new .env
```

### Required Stripe Environment Variables:

1. **STRIPE_SECRET_KEY**: Get from [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys)
   - Use test key (`sk_test_...`) for development
   - Use live key (`sk_live_...`) for production

2. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Also from API Keys page
   - Use test key (`pk_test_...`) for development
   - Use live key (`pk_live_...`) for production

3. **STRIPE_PRO_PRICE_ID**: Create a product and price in Stripe Dashboard
   - Go to [Products](https://dashboard.stripe.com/products)
   - Click "Add product"
   - Name: "Myers Prompt Guru Pro"
   - Description: "Pro subscription with unlimited prompts, bulk import, OCR, and AI chat"
   - Pricing model: "Recurring"
   - Price: $5.00 USD
   - Billing period: Monthly
   - Copy the Price ID (starts with `price_...`)

4. **STRIPE_WEBHOOK_SECRET**: Set up webhook endpoint
   - For local development: Use Stripe CLI (see below)
   - For production: Configure in Stripe Dashboard (see below)

5. **NEXT_PUBLIC_APP_URL**: Your application URL
   - Development: `http://localhost:9002`
   - Production: Your deployed URL (e.g., `https://yourapp.vercel.app`)

## 3. Set Up Stripe Webhooks

### For Local Development (using Stripe CLI):

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli#install

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:9002/api/stripe/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_...`) and add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### For Production (Stripe Dashboard):

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)

2. Click "Add endpoint"

3. Endpoint URL: `https://yourapp.vercel.app/api/stripe/webhook`

4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Click "Add endpoint"

6. Copy the "Signing secret" and add to your production environment variables

## 4. Configure Firebase Admin SDK

### For Local Development:

Firebase Admin SDK will use Application Default Credentials. If you need to use a service account:

1. Go to [Firebase Console → Project Settings → Service Accounts](https://console.firebase.google.com/)
2. Click "Generate new private key"
3. Save the JSON file securely (DO NOT commit to git)
4. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

### For Production (Vercel):

Vercel will automatically use the Firebase project ID from `NEXT_PUBLIC_FIREBASE_PROJECT_ID`. No additional configuration needed.

## 5. Update Firestore Security Rules

The Firestore rules need to be updated to prevent clients from directly modifying Stripe-related fields. Add this to your `firestore.rules`:

```javascript
function isUpdatingValidUser() {
  // Existing validation
  let validIdUpdate = request.resource.data.id == resource.data.id;
  
  // Prevent client from modifying Stripe fields
  let stripeFieldsUnchanged = 
    (!request.resource.data.keys().hasAny(['stripeCustomerId', 'stripeSubscriptionId', 'subscriptionStatus']) ||
    (request.resource.data.get('stripeCustomerId', null) == resource.data.get('stripeCustomerId', null) &&
     request.resource.data.get('stripeSubscriptionId', null) == resource.data.get('stripeSubscriptionId', null) &&
     request.resource.data.get('subscriptionStatus', null) == resource.data.get('subscriptionStatus', null)));
  
  return validIdUpdate && stripeFieldsUnchanged;
}
```

Deploy the updated rules:
```bash
firebase deploy --only firestore:rules
```

## 6. Update Frontend Components

Replace the old go-pro-dialog component with the new one:

```bash
mv src/components/app/go-pro-dialog.tsx src/components/app/go-pro-dialog-old.tsx
mv src/components/app/go-pro-dialog-new.tsx src/components/app/go-pro-dialog.tsx
```

## 7. Update Profile Page

Add the subscription management component to `src/app/profile/page.tsx`:

```tsx
import { ManageSubscription } from "@/components/app/manage-subscription";

// In the subscription card section, replace the upgrade button with:
{userProfile.isPro ? (
  <ManageSubscription />
) : (
  <GoProDialog>
    <Button><Sparkles className="mr-2 h-4 w-4" />Upgrade to Pro</Button>
  </GoProDialog>
)}
```

## 8. Test the Integration

### Test Checkout Flow:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:9002/api/stripe/webhook
   ```

3. Sign in to your app

4. Click "Upgrade to Pro"

5. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

6. Complete checkout

7. Verify webhook received in Stripe CLI terminal

8. Check that user profile shows Pro status

### Test Subscription Management:

1. As a Pro user, go to Profile page

2. Click "Manage Subscription"

3. Verify redirect to Stripe Customer Portal

4. Test canceling subscription

5. Verify webhook received and Pro status removed

## 9. Deploy to Production

### Vercel Deployment:

1. Add all environment variables in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env` (use production values)

2. Deploy:
   ```bash
   git add .
   git commit -m "Add Stripe integration"
   git push
   ```

3. Configure production webhook in Stripe Dashboard (see step 3)

4. Test production flow with real payment (or test mode in production)

## 10. Monitoring and Maintenance

### Monitor Webhooks:

- Check [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
- View webhook delivery attempts and failures
- Stripe will retry failed webhooks automatically

### Monitor Subscriptions:

- Check [Stripe Dashboard → Customers](https://dashboard.stripe.com/customers)
- View active subscriptions, failed payments, etc.

### Sync Issues:

If a user's Pro status gets out of sync:
- The `/api/stripe/subscription-status` endpoint will sync on next login
- Or manually sync by calling the endpoint

## Troubleshooting

### Webhook Not Receiving Events:

1. Check webhook endpoint is publicly accessible
2. Verify webhook secret is correct
3. Check Stripe Dashboard for delivery attempts and errors
4. Ensure raw body parsing is enabled for webhook route

### User Not Upgraded After Payment:

1. Check webhook logs in Stripe Dashboard
2. Verify `firebaseUserId` is in checkout session metadata
3. Check Firestore for user document updates
4. Manually sync using subscription-status endpoint

### Firebase Admin Errors:

1. Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set
2. Check service account permissions (if using service account)
3. Ensure Firestore API is enabled in Google Cloud Console

## Security Checklist

- [ ] Webhook signature verification is enabled
- [ ] Firebase Auth tokens are verified on all API routes
- [ ] Firestore rules prevent client modification of Stripe fields
- [ ] Environment variables are not exposed to client
- [ ] Stripe keys are using correct mode (test/live)
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is configured (consider adding)

## Next Steps

After successful integration:

1. Set up email notifications (Stripe can send these automatically)
2. Add analytics tracking for subscription events
3. Implement proration for plan changes (if needed)
4. Add coupon/promotion code support (already enabled in checkout)
5. Consider adding annual billing option
6. Set up Stripe Tax for automatic tax calculation (if needed)
