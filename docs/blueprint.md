# **App Name**: PromptMaster - AI Prompt Library & Manager

## Core Features:

- Navigation: Collapsible sidebar with category filters, My Library (Saved), History
- TopBar: Global search with advanced queries (tag:, var:), User profile dropdown, Go Pro button, Add Prompt button
- PromptCardSystem: Identify variables enclosed in square brackets [VariableName]. Single input per variable updates all visible prompts in real time. Display filled-in prompt text live on each card. CopyToClipboard, Bookmark, Rate
- AIBulkImport: Accepts Text Input or Image Upload (Paste/Drop).  Extract distinct prompts and return valid JSON objects: Title, Description, Template, Category, Tags.  Save extracted prompts to Firestore prompts collection.
- GuruChat: You are a Senior Prompt Architect. Slide-out conversational interface
- SubscriptionSystem: $5.00 per month for Guru Chat and Unlimited Saves. Toggle isPro field on user document.
- User Authentication: Email/Password and Google Sign-In with login persistence.
- Firestore Integration: Data persistence using Firestore with 'users' and 'prompts' collections.

## Style Guidelines:

- Slate-based neutral palette
- Blue/Indigo primary actions
- rounded-xl components
- subtle borders and shadows
- glassmorphism modals
- responsive mobile drawer