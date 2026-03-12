/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { JobPosting, ScrapeResponse } from './types';
import { scrapeAll } from './lib/scraper/dummy';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import JobCard from './components/JobCard';

export default function App() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingDummy, setUsingDummy] = useState(false);

  // 필터 상태
  const [category, setCategory] = useState('873');
  const [searchTerm, setSearchTerm] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('전체 지역');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);

  const fetchJobs = async () => {
    setLoading(true);
    setUsingDummy(false);
    try {
      const response = await fetch(`/api/scrape/wanted?category=${category}`);
      const result: ScrapeResponse = await response.json();
      if (result.success && result.data.length > 0) {
        setJobs(result.data);
      } else {
        // API 실패 시 더미 데이터로 대체
        const dummyData = await scrapeAll();
        setJobs(dummyData);
        setUsingDummy(true);
      }
    } catch {
      // 서버 미연결 시 더미 데이터 표시
      const dummyData = await scrapeAll();
      setJobs(dummyData);
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [category]);

  const filteredJobs = jobs.filter(job => {
    const matchSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchLocation =
      location === '전체 지역' || job.location.includes(location.replace(' 전체', ''));

    const matchStack =
      selectedStacks.length === 0 ||
      selectedStacks.some(s => job.techStacks.includes(s));

    return matchSearch && matchLocation && matchStack;
  });

  const categoryLabel = category === '873' ? '프론트엔드' : '백엔드';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#334155] font-sans flex">
      <Sidebar
        category={category}
        setCategory={setCategory}
        experience={experience}
        setExperience={setExperience}
        location={location}
        setLocation={setLocation}
        selectedStacks={selectedStacks}
        setSelectedStacks={setSelectedStacks}
      />

      <main className="flex-1 p-8">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSync={fetchJobs}
          loading={loading}
        />

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <StatsCard label="수집된 공고" value={loading ? '...' : jobs.length} />
          <StatsCard label="검색 결과" value={filteredJobs.length} highlight />
          <StatsCard label="활성 플랫폼" value="1" />
        </div>

        {/* 공고 리스트 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800">{categoryLabel} 채용 공고</h2>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              {usingDummy && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-semibold">
                  더미 데이터
                </span>
              )}
              최신순
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <RefreshCw className="h-12 w-12 text-[#007bff] animate-spin" />
                <p className="text-slate-500 font-medium">원티드에서 데이터를 가져오는 중입니다...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, idx) => (
                <JobCard key={job.id} job={job} index={idx} />
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
