# Security Policy

## Environment Variables

This project uses environment variables to manage sensitive credentials. **Never commit `.env` files to version control.**

### Required Environment Variables

#### Development (.env file)
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Production (Vercel/Firebase Environment Variables)
Set these in your deployment platform:
- `GEMINI_API_KEY` - Your Google Gemini API key

### Firebase Configuration

Firebase configuration in `src/firebase/config.ts` contains API keys that are **safe to commit** when properly configured with Firebase security rules and domain restrictions.

**Important:** While Firebase API keys can be public, you must:
1. Enable Firebase App Check for production
2. Configure domain restrictions in Firebase Console
3. Implement proper Firestore security rules (already done in `firestore.rules`)

See: https://firebase.google.com/docs/projects/api-keys

### Setting Up Your Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your Gemini API key:
   - Visit: https://aistudio.google.com/app/apikey
   - Create a new API key
   - Add it to your `.env` file

3. Never commit your `.env` file to Git

### Reporting Security Issues

If you discover a security vulnerability, please email: myersdigitalservicesai@gmail.com

Do not create public GitHub issues for security vulnerabilities.
