# Quick Start Guide - Stripe Integration

## 1. Install Dependencies (2 minutes)

```bash
npm install stripe firebase-admin
```

## 2. Create Stripe Product (5 minutes)

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"
3. Fill in:
   - Name: **Myers Prompt Guru Pro**
   - Description: **Pro subscription with unlimited prompts, bulk import, OCR, and AI chat**
   - Pricing: **Recurring** → **$5.00 USD** → **Monthly**
4. Click "Save product"
5. Copy the **Price ID** (starts with `price_...`)

## 3. Set Environment Variables (5 minutes)

Add these to your `.env` file or Vercel environment:

```bash
# From Stripe Dashboard → Developers → API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# From step 2 above
STRIPE_PRO_PRICE_ID=price_...

# Will be set after webhook configuration (step 5)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 4. Update Frontend (2 minutes)

```bash
# Replace old component with new one
mv src/components/app/go-pro-dialog.tsx src/components/app/go-pro-dialog-old.tsx
mv src/components/app/go-pro-dialog-new.tsx src/components/app/go-pro-dialog.tsx

# Update Firestore rules
mv firestore.rules firestore.rules.old
mv firestore.rules.new firestore.rules
firebase deploy --only firestore:rules

# Update .env.example
mv .env.example .env.example.old
mv .env.example.new .env.example
```

## 5. Test Locally (10 minutes)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:9002/api/stripe/webhook
# Copy the webhook secret (whsec_...) and add to .env as STRIPE_WEBHOOK_SECRET

# Terminal 3: Test the flow
# 1. Open http://localhost:9002
# 2. Sign in
# 3. Click "Upgrade to Pro"
# 4. Use test card: 4242 4242 4242 4242
# 5. Complete checkout
# 6. Verify webhook received in Terminal 2
# 7. Verify Pro status in app
```

## 6. Deploy to Production (10 minutes)

```bash
# Commit changes
git add .
git commit -m "Add Stripe payment integration"
git push

# In Vercel Dashboard:
# 1. Go to Project Settings → Environment Variables
# 2. Add all STRIPE_* variables (use LIVE keys for production)
# 3. Redeploy

# In Stripe Dashboard:
# 1. Go to Developers → Webhooks
# 2. Click "Add endpoint"
# 3. URL: https://yourapp.vercel.app/api/stripe/webhook
# 4. Select events:
#    - checkout.session.completed
#    - customer.subscription.created
#    - customer.subscription.updated
#    - customer.subscription.deleted
#    - invoice.payment_succeeded
#    - invoice.payment_failed
# 5. Copy webhook secret and add to Vercel environment variables
# 6. Redeploy again
```

## 7. Test Production (5 minutes)

1. Visit your production app
2. Sign in
3. Click "Upgrade to Pro"
4. Complete checkout (use real card or test mode)
5. Verify webhook received (Stripe Dashboard → Webhooks)
6. Verify Pro status in app
7. Test "Manage Subscription" button

## Done! 🎉

Your Stripe integration is live. Monitor the first few transactions closely.

## Troubleshooting

**Webhook not working?**
- Check webhook endpoint is publicly accessible
- Verify webhook secret matches in environment variables
- Check Stripe Dashboard → Webhooks for delivery attempts

**User not upgraded?**
- Check Stripe Dashboard → Webhooks for errors
- Check application logs for errors
- Try manual sync: call `/api/stripe/subscription-status`

**Need help?**
- See `STRIPE_SETUP_INSTRUCTIONS.md` for detailed guide
- See `PRODUCTION_READINESS_AUDIT.md` for security checklist
- See `IMPLEMENTATION_SUMMARY.md` for architecture details
