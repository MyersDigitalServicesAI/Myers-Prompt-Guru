# Security Policy

## Environment Variables

This project uses environment variables to manage sensitive credentials. **Never commit `.env` files to version control.**

### Required Environment Variables

#### Development (.env file)

```bash
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (NEXT_PUBLIC_ prefix makes these available in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Production (Vercel/Firebase Environment Variables)

Set these in your deployment platform's environment configuration:

**Backend (Server-side only):**
- `GEMINI_API_KEY` - Your Google Gemini API key

**Frontend (Browser-accessible):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Setting Up Your Environment

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Gemini API key:**
   - Visit: https://aistudio.google.com/app/apikey
   - Create a new API key
   - Add it to your `.env` file as `GEMINI_API_KEY`

3. **Get your Firebase configuration:**
   - Visit: https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
   - Scroll to "Your apps" section
   - Copy the config values to your `.env` file with `NEXT_PUBLIC_` prefix

4. **Never commit your `.env` file to Git**

### Firebase Security

Firebase configuration values with the `NEXT_PUBLIC_` prefix are exposed in the browser. This is **safe and expected** when:

1. ✅ Firebase security rules are properly configured (see `firestore.rules`)
2. ✅ Firebase Authentication is enabled
3. ✅ Domain restrictions are set in Firebase Console (recommended for production)

**Important:** While Firebase API keys can be public, you should:
- Enable Firebase App Check for production
- Configure authorized domains in Firebase Console
- Implement proper Firestore security rules (already done in `firestore.rules`)

See: https://firebase.google.com/docs/projects/api-keys

### Deployment Checklist

Before deploying to production:

- [ ] All environment variables are set in your deployment platform
- [ ] Firebase domain restrictions are configured
- [ ] Firebase App Check is enabled (optional but recommended)
- [ ] Gemini API key has usage limits/quotas configured
- [ ] `.env` file is in `.gitignore` and not committed

### Reporting Security Issues

If you discover a security vulnerability, please email: myersdigitalservicesai@gmail.com

Do not create public GitHub issues for security vulnerabilities.

---

## Git History Cleanup

This repository had exposed secrets removed from Git history on February 4, 2026. If you cloned the repository before this date, you should:

```bash
# Fetch the cleaned history
git fetch origin

# Reset your local branch to match the cleaned remote
git reset --hard origin/main

# Clean up local references
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```
