import React from 'react';
import { AlertTriangle, Target, TrendingUp, BarChart3, ShieldCheck, BrainCircuit } from 'lucide-react';

const HomePage = () => {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <section className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-blue-300 mb-4">
            <BrainCircuit size={14} /> LLM-Powered Construction Intelligence for Owners
          </p>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight text-white">
            Know the Real Cost of Building a Complex in Minutes
          </h2>
          <p className="mt-5 text-slate-300 leading-relaxed">
            For property owners, cost uncertainty is risky and expensive. BLAZE uses Gemini LLM analysis to read blueprint images, estimate total construction cost in Indian Rupees, and break down all major material costs before you commit.
          </p>
          <div className="mt-6 flex gap-4 text-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <p className="text-slate-400">Core Outcome</p>
              <p className="text-white font-semibold">Budget Clarity in INR</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <p className="text-slate-400">Advantage</p>
              <p className="text-white font-semibold">Material-Level Transparency</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-red-400" /> Problem Statement</h3>
          <p className="text-slate-300 leading-relaxed text-sm">
            Manual estimation often misses hidden variables like steel, cement, and labor volatility. For owners, this creates budget overruns, delayed approvals, and uncertainty around the real cost of a building or complex.
          </p>
          <h3 className="font-bold text-white text-lg mt-6 mb-4 flex items-center gap-2"><Target size={18} className="text-green-400" /> Solution</h3>
          <p className="text-slate-300 leading-relaxed text-sm">
            BLAZE generates owner-friendly estimates using Gemini LLMs: total project cost in INR, complete material take-off costs, risk flags, and strategy insights to plan with confidence before construction starts.
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <TrendingUp className="text-blue-400 mb-3" size={20} />
          <p className="text-sm text-slate-400">Real-Time Response</p>
          <h4 className="text-white font-bold mt-1">Rapid Bid Intelligence</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <BarChart3 className="text-green-400 mb-3" size={20} />
          <p className="text-sm text-slate-400">Structured Outputs</p>
          <h4 className="text-white font-bold mt-1">All Material Costs Listed</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <ShieldCheck className="text-cyan-400 mb-3" size={20} />
          <p className="text-sm text-slate-400">Margin Protection</p>
          <h4 className="text-white font-bold mt-1">Gemini LLM Risk Insights</h4>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
