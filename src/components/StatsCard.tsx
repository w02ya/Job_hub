import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export default function StatsCard({ label, value, highlight = false }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold ${highlight ? 'text-[#007bff]' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}
