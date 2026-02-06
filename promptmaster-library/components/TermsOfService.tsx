import React from 'react';
import { FileText, Scale, Zap, AlertTriangle, ArrowLeft } from 'lucide-react';

export const TermsOfService: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-[#020617] overflow-y-auto animate-in fade-in duration-500 custom-scrollbar">
            {/* Background Accents */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16">
                <button
                    onClick={onClose}
                    className="mb-12 flex items-center gap-3 text-slate-500 hover:text-white transition-all group font-black uppercase tracking-widest text-xs"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                    Exit Legal Subsystem
                </button>

                <header className="mb-20">
                    <div className="bg-purple-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center text-purple-400 mb-8 border border-purple-500/20 shadow-2xl">
                        <Scale className="w-10 h-10" />
                    </div>
                    <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase">Terms of <span className="text-purple-500">Operation</span></h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">VERIFIED 02.02.2026 • SECTOR ALPHA</p>
                </header>

                <div className="space-y-12">
                    <section className="glass p-10 rounded-[2.5rem] border border-white/5">
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4 tracking-tight uppercase">
                            <Zap className="w-6 h-6 text-purple-500" /> Operational Upgrade
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed">Pro sub-routines (AI Oracle, Bulk Neural Injection, OCR) operate on a monthly synchronization fee. Access is granted instantly upon unit verification via Stripe. Cancellation voids access at the end of the current cycle.</p>
                    </section>

                    <section className="glass p-10 rounded-[2.5rem] border border-white/5">
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4 tracking-tight uppercase">
                            <AlertTriangle className="w-6 h-6 text-purple-500" /> Oracle Disclaimer
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed">AI-derived units and Oracle directives are provided as-is. We do not guarantee core integrity or production results. Architects are solely responsible for unit validation prior to deployment.</p>
                    </section>

                    <footer className="pt-20 pb-10 text-center border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">&copy; 2026 MYERS DIGITAL SERVICES • ALL RIGHTS RESERVED</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};
