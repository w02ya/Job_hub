/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { JobPosting, ScrapeResponse } from './types';
import { Search, RefreshCw, MapPin, Briefcase, Calendar, ExternalLink, Database, Layout, User, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('873'); // 873: Frontend, 872: Backend
  const [searchTerm, setSearchTerm] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/scrape/wanted?category=${category}`);
      const result: ScrapeResponse = await response.json();
      if (result.success) {
        setJobs(result.data);
      } else {
        console.error("Scraping failed:", result.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [category]);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155] font-sans flex">
      {/* Sidebar */}
      <aside className="w-[280px] h-screen sticky top-0 bg-white border-r border-slate-200 p-6 flex flex-col z-10">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-[#007bff] flex items-center gap-2">
            <Database className="h-8 w-8" />
            채용 모아
            <span className="text-sm font-medium text-slate-400 ml-1">(JobHub)</span>
          </h1>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
              채용 플랫폼
            </h3>
            <div className="space-y-3">
              {['원티드', '사람인', '잡코리아', '로켓펀치'].map(p => (
                <label key={p} className="flex items-center text-sm cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={p === '원티드'} 
                    readOnly
                    className="rounded border-slate-300 text-[#007bff] focus:ring-[#007bff] mr-3" 
                  />
                  <span className="text-slate-600 group-hover:text-[#007bff]">{p}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-4">직군 선택</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setCategory('873')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === '873' ? 'bg-[#007bff] text-white' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <Layout className="h-4 w-4" />
                프론트엔드
              </button>
              <button 
                onClick={() => setCategory('872')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === '872' ? 'bg-[#007bff] text-white' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <Code className="h-4 w-4" />
                백엔드
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-4">경력</h3>
            <div className="space-y-3">
              {['신입', '1-3년', '4-6년', '시니어(7년+)'].map(exp => (
                <label key={exp} className="flex items-center text-sm cursor-pointer group">
                  <input type="radio" name="exp" className="border-slate-300 text-[#007bff] focus:ring-[#007bff] mr-3" />
                  <span className="text-slate-600 group-hover:text-[#007bff]">{exp}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 text-[10px] text-slate-400">
          © 2026 채용 모아 (JobHub). All rights reserved.
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="채용 공고명, 회사명 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-[#007bff]/10 focus:border-[#007bff] transition-all shadow-sm"
            />
            <Search className="h-5 w-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#007bff]" />
          </div>
          <button 
            onClick={fetchJobs}
            disabled={loading}
            className="h-12 px-6 bg-[#007bff] hover:bg-[#0056b3] text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-[#007bff]/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            지금 동기화
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">수집된 공고</p>
            <p className="text-3xl font-bold text-slate-800">{loading ? '...' : jobs.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">검색 결과</p>
            <p className="text-3xl font-bold text-[#007bff]">{filteredJobs.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">활성 플랫폼</p>
            <p className="text-3xl font-bold text-slate-800">1</p>
          </div>
        </div>

        {/* Job List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800">
              {category === '873' ? '프론트엔드' : '백엔드'} 채용 공고
            </h2>
            <div className="text-sm text-slate-500">최신순</div>
          </div>

          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <RefreshCw className="h-12 w-12 text-[#007bff] animate-spin" />
                <p className="text-slate-500 font-medium">원티드에서 데이터를 가져오는 중입니다...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, idx) => (
                <motion.article 
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-[#007bff]/30 transition-all group"
                >
                  <div className="flex gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-slate-400 text-center px-1 font-medium leading-tight">회사<br/>로고</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-[#007bff] transition-colors">{job.title}</h3>
                          <div className="flex items-center text-sm text-slate-500 gap-2 mb-3">
                            <span className="font-semibold text-slate-700">{job.company}</span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                          <div className="w-4 h-4 bg-[#007bff] rounded-sm flex items-center justify-center text-[10px] text-white font-bold">W</div>
                          <span className="text-xs font-medium text-slate-500">{job.platform}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#007bff] bg-[#e6f2ff] px-2 py-0.5 rounded">
                          <Briefcase className="h-3 w-3" /> {job.experience}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#007bff] bg-[#e6f2ff] px-2 py-0.5 rounded">
                          <Calendar className="h-3 w-3" /> {job.deadline}
                        </span>
                      </div>

                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100/50 relative">
                        <div className="absolute -top-2 left-4 px-2 bg-white border border-slate-100 rounded text-[10px] font-bold text-slate-400">AI 요약</div>
                        <p className="text-sm text-slate-600">
                          {job.company}에서 역량 있는 {job.title} 개발자를 모집합니다. 상세 공고를 확인하고 지원해 보세요.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <span className="text-xs text-slate-400">등록일: {job.postedAt}</span>
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-8 py-3 bg-[#007bff] hover:bg-[#0056b3] text-white font-bold rounded-xl transition-colors shadow-md shadow-[#007bff]/10 flex items-center gap-2"
                      >
                        지원하기 <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="text-center py-20 text-slate-500">
                데이터가 없습니다. '지금 동기화' 버튼을 눌러보세요.
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
