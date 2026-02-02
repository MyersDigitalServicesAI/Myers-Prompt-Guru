<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Myers Prompt Guru

**Myers Prompt Guru** is a state-of-the-art prompt management library and development environment. It combines an intuitive library interface with powerful, real-time prompt engineering tools and a specialized AI Guru with a deep, protected knowledge base.

## 🚀 Key Features

- **Focused Prompt Editor**: A dedicated workspace for refining prompts.
    - **"Outside Box" Variables**: Separate configuration sidebar for variable input.
    - **Real-Time Injection**: View prompt updates instantly as you type.
    - **Validation**: Intelligent tracking of character counts and unfilled placeholders.
- **Prompt Guru (AI Architect)**: A specialized chat agent powered by Gemini.
    - **Hidden Knowledge Base**: Uses advanced prompt engineering, psychology, and logic techniques (Chain-of-Thought, XML structuring, etc.).
    - **Secure Architecture**: Protected by strict guardrails to prevent system instruction leakage.
- **Multi-Modal Bulk Import**:
    - **OCR Extraction**: Extract prompts directly from screenshots or photos.
    - **Batch Processing**: Upload entire collections via text or JSON files.
- **Monetization Engine**: Integrated $5.00/mo Pro tier gating premium features (Guru, Bulk Upload, OCR).

## 🛠 Tech Stack

- **Frontend**: React 19 (Vite), Tailwind CSS
- **AI Engine**: Google Gemini (via `@google/genai`)
- **Icons**: Lucide React
- **Testing**: Playwright E2E

---

## Run and deploy your AI Studio app

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env](.env) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

This app is optimized for deployment on **Vercel**. 

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Add `GEMINI_API_KEY` in your Vercel project settings.

See the [Deployment Guide](file:///C:/Users/dm083/.gemini/antigravity/brain/67ae647f-49c4-4167-aff9-cb0206d08958/deployment_guide.md) for detailed steps.
