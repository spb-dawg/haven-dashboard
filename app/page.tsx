'use client'; 

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ShieldCheckIcon, 
  MapIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

// TIER CARD COMPONENT
const TierCard = ({ title, count, color, borderColor, icon: Icon }: any) => (
  <div className={`p-8 rounded-3xl bg-white shadow-sm border-2 ${borderColor}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-sm font-black uppercase tracking-widest ${color}`}>{title}</h3>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <span className="text-5xl font-black text-slate-900 block mb-2">{count}</span>
  </div>
);

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [counts, setCounts] = useState({ Sanctuary: 0, Outpost: 0, Sinkhole: 0 });
  const [loading, setLoading] = useState(false);

  const fetchVaultData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('haven_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setJobs(data);
      setCounts({
        Sanctuary: data.filter(j => j.tier === 'Sanctuary').length,
        Outpost: data.filter(j => j.tier === 'Outpost').length,
        Sinkhole: data.filter(j => j.tier === 'Sinkhole').length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900">
              HAVEN<span className="text-emerald-600">.</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">
              Operational Intelligence Dashboard
            </p>
          </div>
          <button 
            onClick={fetchVaultData}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Vault
          </button>
        </header>

        {/* TIER CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <TierCard title="Sanctuary" count={counts.Sanctuary} color="text-emerald-600" borderColor="border-emerald-100" icon={ShieldCheckIcon} />
          <TierCard title="Outpost" count={counts.Outpost} color="text-amber-500" borderColor="border-amber-100" icon={MapIcon} />
          <TierCard title="Sinkhole" count={counts.Sinkhole} color="text-rose-500" borderColor="border-rose-100" icon={ExclamationTriangleIcon} />
        </div>

        {/* JOB LOG TABLE */}
        <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
          <h2 className="text-xl font-black mb-8 border-b border-slate-50 pb-4">Recent Scans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs font-black uppercase tracking-widest">
                  <th className="pb-4">Company</th>
                  <th className="pb-4">Title</th>
                  <th className="pb-4">Score</th>
                  <th className="pb-4">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {jobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-bold text-slate-900">{job.company}</td>
                    <td className="py-4 text-slate-500">{job.title}</td>
                    <td className="py-4 font-mono font-bold text-slate-900">{job.wu_score}</td>
                    <td className="py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                        job.tier === 'Sanctuary' ? 'bg-emerald-50 text-emerald-600' :
                        job.tier === 'Outpost' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {job.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.length === 0 && (
              <p className="text-center py-12 text-slate-400 font-medium">Vault is currently empty. Run the Extension on LinkedIn to begin.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
