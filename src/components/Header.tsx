import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onSync: () => void;
  loading: boolean;
}

export default function Header({ searchTerm, setSearchTerm, onSync, loading }: HeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="relative flex-1 group">
        <input
          type="text"
          placeholder="채용 공고명, 회사명 검색..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#007bff]/10 focus:border-[#007bff] transition-all shadow-sm outline-none"
        />
        <Search className="h-5 w-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#007bff]" />
      </div>
      <button
        onClick={onSync}
        disabled={loading}
        className="h-12 px-6 bg-[#007bff] hover:bg-[#0056b3] text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-[#007bff]/20 disabled:opacity-50"
      >
        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        지금 동기화
      </button>
    </div>
  );
}
