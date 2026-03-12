import React, { useState } from 'react';
import { ChevronDown, Search, Briefcase } from 'lucide-react';

interface SidebarProps {
  category: string;
  setCategory: (c: string) => void;
  experience: string;
  setExperience: (e: string) => void;
  location: string;
  setLocation: (l: string) => void;
  selectedStacks: string[];
  setSelectedStacks: (s: string[]) => void;
  activePlatforms: string[];
  setActivePlatforms: (p: string[]) => void;
}

const PLATFORMS = ['원티드', '사람인', '잡코리아', '로켓펀치', '잡플래닛', '링커리어'];
const TECH_STACKS = ['React', 'Vue', 'TypeScript', 'Node.js', 'Python', 'Java', 'Spring', 'Go', 'Kotlin', 'Swift'];
const EXPERIENCES = ['신입', '1-3년', '4-6년', '시니어(7년+)'];
const LOCATIONS = ['전체 지역', '서울 전체', '경기 전체', '인천', '대전', '부산'];

export default function Sidebar({
  category, setCategory,
  experience, setExperience,
  location, setLocation,
  selectedStacks, setSelectedStacks,
  activePlatforms, setActivePlatforms,
}: SidebarProps) {
  const [stackSearch, setStackSearch] = useState('');

  const filteredStacks = TECH_STACKS.filter(s =>
    s.toLowerCase().includes(stackSearch.toLowerCase())
  );

  const toggleStack = (stack: string) => {
    setSelectedStacks(
      selectedStacks.includes(stack)
        ? selectedStacks.filter(s => s !== stack)
        : [...selectedStacks, stack]
    );
  };

  const togglePlatform = (platform: string) => {
    setActivePlatforms(
      activePlatforms.includes(platform)
        ? activePlatforms.filter(p => p !== platform)
        : [...activePlatforms, platform]
    );
  };

  return (
    <aside className="w-[280px] h-screen sticky top-0 bg-white border-r border-slate-200 p-6 flex flex-col z-10">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-[#007bff] flex items-center gap-2">
          <Briefcase className="h-8 w-8" />
          채용 모아
          <span className="text-sm font-medium text-slate-400 ml-1">(JobHub)</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
        {/* 채용 플랫폼 */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            채용 플랫폼
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </h3>
          <div className="space-y-3">
            {PLATFORMS.map(p => (
              <label key={p} className="flex items-center text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={activePlatforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                  className="rounded border-slate-300 text-[#007bff] focus:ring-[#007bff] mr-3"
                />
                <span className="text-slate-600 group-hover:text-[#007bff]">{p}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 직군 */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            직군 선택
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </h3>
          <div className="space-y-2">
            {[{ id: '873', label: '프론트엔드' }, { id: '872', label: '백엔드' }].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === id ? 'bg-[#007bff] text-white' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* 기술 스택 */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            기술 스택
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </h3>
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="스택 검색..."
                value={stackSearch}
                onChange={e => setStackSearch(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg py-1.5 pl-8 pr-2 focus:outline-none focus:border-[#007bff]"
              />
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {filteredStacks.map(stack => (
                <button
                  key={stack}
                  onClick={() => toggleStack(stack)}
                  className={`px-2 py-1 text-xs font-medium rounded-md border transition-colors ${
                    selectedStacks.includes(stack)
                      ? 'bg-[#e6f2ff] text-[#007bff] border-[#007bff]/20'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-[#007bff]/30'
                  }`}
                >
                  {stack}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 경력 */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
            경력
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </h3>
          <div className="space-y-3">
            {EXPERIENCES.map(exp => (
              <label key={exp} className="flex items-center text-sm cursor-pointer group">
                <input
                  type="radio"
                  name="experience"
                  checked={experience === exp}
                  onChange={() => setExperience(exp)}
                  className="border-slate-300 text-[#007bff] focus:ring-[#007bff] mr-3"
                />
                <span className="text-slate-600 group-hover:text-[#007bff]">{exp}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 근무 지역 */}
        <section>
          <h3 className="text-sm font-bold text-slate-800 mb-4">근무 지역</h3>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#007bff] text-slate-600"
          >
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </section>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 text-[10px] text-slate-400">
        © 2026 채용 모아 (JobHub). All rights reserved.
      </div>
    </aside>
  );
}
