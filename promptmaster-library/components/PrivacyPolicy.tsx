import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft, Sparkles } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <button
                    onClick={onClose}
                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Library
                </button>

                <header className="mb-12">
                    <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
                    <p className="text-slate-500">Last updated: February 2, 2026</p>
                </header>

                <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-500" /> 1. Information We Collect
                        </h2>
                        <p>We collect information you provide directly to us when you create an account, save prompts, or communicate with our AI Guru. This may include:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Name and email address</li>
                            <li>Subscription and payment status (via Stripe)</li>
                            <li>Prompt history and saved content</li>
                            <li>Communication data with our AI services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-blue-500" /> 2. How We Use Your Information
                        </h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process your transactions and manage your Pro subscription</li>
                            <li>Personalize your experience with the AI Guru</li>
                            <li>Communicate with you about products, services, and events</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-500" /> 3. AI Data Processing
                        </h2>
                        <p>Our application uses Google Gemini (AI) to process prompts and images. While we do not use your personal prompts to train global models, data sent to these services is subject to their respective privacy policies. We implement a secure backend proxy to protect your identifying information during these calls.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> 4. Data Security
                        </h2>
                        <p>We implement industry-standard security measures to protect your data. Payment information is handled exclusively by Stripe and is never stored on our servers.</p>
                    </section>

                    <footer className="pt-12 border-t border-slate-100 text-sm text-slate-400">
                        <p>&copy; 2026 Myers Digital Services. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};
