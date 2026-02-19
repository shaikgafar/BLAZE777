import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BlueprintPage from './pages/BlueprintPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans">
        <header className="sticky top-0 z-20 bg-[#0F172A]/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-lg"><ShieldCheck size={24} className="text-white" /></div>
              <h1 className="text-xl font-black tracking-tighter text-white">BLAZE<span className="text-orange-400">AI</span></h1>
            </div>
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">Home</Link>
              <Link to="/blueprint" className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors">Blueprint Estimator</Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blueprint" element={<BlueprintPage />} />
        </Routes>

        <footer className="border-t border-slate-800 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-slate-500 flex justify-between">
            <p>BLAZE · Gemini LLM Cost Intelligence for Property Owners</p>
            <p>Built for accurate INR cost planning and material transparency</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;