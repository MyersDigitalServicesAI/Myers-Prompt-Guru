# Deployment Guide

## Environment Setup

### Vercel Deployment

1. **Connect your GitHub repository to Vercel**
   - Visit: https://vercel.com/new
   - Import your repository

2. **Configure Environment Variables**
   
   In your Vercel project settings, add these environment variables:

   ```bash
   # Server-side only (not exposed to browser)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Client-side (exposed in browser - safe with Firebase security rules)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Firebase App Hosting Deployment

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```

3. **Set Environment Variables**
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## Post-Deployment Security

### Firebase Console Configuration

1. **Set Authorized Domains**
   - Go to: Firebase Console → Authentication → Settings → Authorized domains
   - Add your production domain (e.g., `yourapp.vercel.app`)

2. **Enable Firebase App Check** (Recommended)
   - Go to: Firebase Console → App Check
   - Register your web app
   - Add reCAPTCHA v3 or other provider

3. **Review Firestore Rules**
   - Ensure `firestore.rules` are deployed
   - Test rules in Firebase Console

### Google Cloud Console Configuration

1. **Set API Key Restrictions**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Find your Gemini API key
   - Add HTTP referrer restrictions (your domain)
   - Set API restrictions (only allow Gemini API)

2. **Set Usage Quotas**
   - Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
   - Set daily/monthly limits to prevent abuse

## Environment Variables Reference

| Variable | Required | Exposed to Browser | Description |
|----------|----------|-------------------|-------------|
| `GEMINI_API_KEY` | Yes | No | Google Gemini API key for AI features |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Yes | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Yes | Firebase authentication domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Yes | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Yes | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Yes | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Yes | Yes | Firebase analytics measurement ID |

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check for typos in environment variable names
- Restart your development server after adding variables

### "Gemini API key not found"
- Ensure `GEMINI_API_KEY` is set (without `NEXT_PUBLIC_` prefix)
- Verify the key is valid in Google AI Studio

### "Firebase API key invalid"
- Regenerate Firebase config from Firebase Console
- Update all `NEXT_PUBLIC_FIREBASE_*` variables
- Clear browser cache and redeploy

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env

# Run development server
npm run dev
```

Visit: http://localhost:9002
