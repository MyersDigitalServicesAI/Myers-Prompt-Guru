import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft, Sparkles } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-[#020617] overflow-y-auto animate-in fade-in duration-500 custom-scrollbar">
            {/* Background Accents */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16">
                <button
                    onClick={onClose}
                    className="mb-12 flex items-center gap-3 text-slate-500 hover:text-white transition-all group font-black uppercase tracking-widest text-xs"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                    Void Legal View
                </button>

                <header className="mb-20">
                    <div className="bg-blue-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20 shadow-2xl">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">PRIVACY <span className="text-blue-500">PROTOCOL</span></h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">REVISION 02.02.2026 • SECTOR ALPHA</p>
                </header>

                <div className="max-w-none space-y-12">
                    <section className="glass p-10 rounded-[2.5rem] border border-white/5">
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4 tracking-tight">
                            <Lock className="w-6 h-6 text-blue-500" /> DATA ACQUISITION
                        </h2>
                        <div className="text-slate-400 space-y-4 font-medium leading-relaxed">
                            <p>We aggregate architectural signals provided directly during node creation, unit optimization, and Guru Oracle synchronization. This includes:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {[
                                    "Neural Identity (Name/Email)",
                                    "Subscription State (Via Stripe)",
                                    "Unit Deployment History",
                                    "Guru Oracle Communication Logs"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-slate-300 text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="glass p-10 rounded-[2.5rem] border border-white/5">
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4 tracking-tight">
                            <Sparkles className="w-6 h-6 text-blue-500" /> NEURAL PROCESSING
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed">Our infrastructure leverages Gemini Neural Engines for unit extraction. No personal units are used for global training. All transmissions pass through encrypted architectural proxies.</p>
                    </section>

                    <footer className="pt-20 pb-10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">&copy; 2026 MYERS DIGITAL SERVICES • ALL RIGHTS RESERVED</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};
