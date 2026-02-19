import React, { useState } from 'react';
import { Upload, Loader2, AlertTriangle, BarChart3, FileText } from 'lucide-react';
import axios from 'axios';

const BlueprintPage = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectType, setProjectType] = useState('Commercial Complex');

  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const processFile = async () => {
    if (!file) {
      setError('Please select an image blueprint first.');
      return;
    }

    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('blueprint', file);
    formData.append('project_type', projectType);

    try {
      const res = await axios.post(`${apiBaseUrl}/analyze`, formData);
      setData(res.data);
    } catch (err) {
      const backendMessage = err?.response?.data?.detail;
      setError(backendMessage || 'Error processing file. Ensure backend is running and configured.');
    } finally {
      setLoading(false);
    }
  };

  const takeOffs = data?.take_offs || [];
  const riskDrivers = data?.risk_drivers || [];
  const totalMaterialCost = takeOffs.reduce((sum, item) => sum + (Number(item?.total) || 0), 0);
  const hasHighRisk = riskDrivers.some((risk) => risk?.severity === 'High');
  const hasMediumRisk = riskDrivers.some((risk) => risk?.severity === 'Medium');
  const riskLevel = hasHighRisk ? 'HIGH' : hasMediumRisk ? 'MEDIUM' : 'LOW';

  const formatINR = (value) => {
    const numericValue = Number(value || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-white">Blueprint Estimator</h2>
        <p className="text-sm text-slate-400 mt-2">Upload your blueprint image to get INR cost estimates, material totals, and risk insights.</p>
      </section>

      <section className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <Upload size={18} className="text-blue-400" /> Upload Blueprint
            </h2>
            <label className="text-xs font-semibold text-slate-400 uppercase">Project Type</label>
            <select
              value={projectType}
              onChange={(event) => setProjectType(event.target.value)}
              className="w-full mt-2 mb-4 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option>Commercial Complex</option>
              <option>Residential Tower</option>
              <option>Industrial Facility</option>
              <option>Hospital Infrastructure</option>
            </select>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => document.getElementById('fileInput').click()}>
              <input type="file" accept="image/*" id="fileInput" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              <p className="text-slate-400 text-sm">{file ? file.name : 'Upload blueprint image (PNG/JPG/WebP)'}</p>
            </div>
            <button
              onClick={processFile}
              disabled={loading}
              className="w-full mt-6 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-900/20 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Generate AI Bid Plan'}
            </button>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {!data && !loading ? (
            <div className="h-[28rem] border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
              <BarChart3 size={48} className="mb-4 opacity-20" />
              <p className="font-semibold text-slate-300">Waiting for blueprint analysis...</p>
              <p className="text-sm text-slate-500 mt-1">Upload an image and run the LLM model to view cost and risk outputs.</p>
            </div>
          ) : loading ? (
            <div className="h-[28rem] flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="animate-pulse text-blue-400 font-mono text-sm">EXTRACTING QUANTITIES... ANALYZING RISK DRIVERS...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Project Summary</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{data?.project_summary || 'No summary returned by model.'}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Estimated Cost (INR)</p>
                  <p className="text-2xl font-mono text-orange-300">{formatINR(data.total_estimated_cost)}</p>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">AI Confidence</p>
                  <p className="text-2xl font-mono text-green-400">{data.confidence_score}%</p>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Risk Level</p>
                  <p className={`text-2xl font-mono ${riskLevel === 'HIGH' ? 'text-red-400' : riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>{riskLevel}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Material Cost (INR)</p>
                  <p className="text-2xl font-mono text-orange-400">{formatINR(totalMaterialCost)}</p>
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Material Line Items</p>
                  <p className="text-2xl font-mono text-cyan-300">{takeOffs.length}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700 flex justify-between">
                  <h3 className="font-bold flex items-center gap-2"><FileText size={16} /> Take-off Analysis</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Component</th>
                      <th className="px-6 py-3">Quantity</th>
                      <th className="px-6 py-3">Unit Cost</th>
                      <th className="px-6 py-3">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {takeOffs.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{item.item}</td>
                        <td className="px-6 py-4 text-slate-400">{item.quantity}</td>
                        <td className="px-6 py-4 font-mono text-slate-200">{formatINR(item.unit_cost)}</td>
                        <td className="px-6 py-4 font-mono text-orange-300">{formatINR(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-red-900/10 border border-red-900/30 p-6 rounded-2xl">
                <h3 className="text-red-400 font-bold flex items-center gap-2 mb-4">
                  <AlertTriangle size={18} /> Financial Risk Mitigation Strategy
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {riskDrivers.map((risk, i) => (
                    <div key={i} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${risk.severity === 'High' ? 'bg-red-500/20 text-red-500' : risk.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                        {risk.severity} RISK
                      </span>
                      <h4 className="mt-2 font-bold text-white">{risk.factor}</h4>
                      <p className="text-xs text-slate-400 mt-1">{risk.impact}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-4 rounded-xl border border-slate-800 bg-slate-900/70">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Market Hedge Strategy</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{data?.market_hedge_strategy || 'No hedge strategy returned by model.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default BlueprintPage;
