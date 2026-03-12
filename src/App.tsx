/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { JobPosting } from './types/job';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import JobCard from './components/JobCard';

export default function App() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);   // 더미 데이터 제거 — 빈 배열
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlatforms, setActivePlatforms] = useState<string[]>([
    '원티드', '잡코리아', '잡플래닛', '링커리어',
  ]);

  const [category, setCategory] = useState('873');
  const [searchTerm, setSearchTerm] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('전체 지역');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      category,
      platforms: activePlatforms.join(','),
    });
    const url = `/api/jobs?${params}`;
    console.log(`[프론트] API 요청 시작 → ${url}`);

    try {
      const response = await fetch(url);
      console.log(`[프론트] 응답 상태: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        const msg = `서버 오류 (${response.status}): ${text.slice(0, 200)}`;
        console.error('[프론트] 서버 오류:', msg);
        setError(msg);
        return;
      }

      const result = await response.json();
      console.log('[프론트] 응답 데이터:', result);

      if (!result.success) {
        const msg = `크롤링 실패: ${result.error ?? '알 수 없는 오류'}`;
        console.error('[프론트]', msg);
        setError(msg);
        return;
      }

      if (result.data.length === 0) {
        const msg = '수집된 공고가 없습니다. 각 사이트 선택자가 변경됐을 수 있습니다.';
        console.warn('[프론트]', msg);
        setError(msg);
        return;
      }

      // 플랫폼별 수집 건수 로그
      const countByPlatform = (result.data as JobPosting[]).reduce<Record<string, number>>((acc, job) => {
        acc[job.platform] = (acc[job.platform] ?? 0) + 1;
        return acc;
      }, {});
      console.log('[프론트] 플랫폼별 수집:', countByPlatform);

      if (result.errors?.length) {
        console.warn('[프론트] 일부 플랫폼 실패:', result.errors);
      }

      setJobs(result.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[프론트] fetch 예외:', msg);
      setError(`데이터를 불러오는 데 실패했습니다: ${msg}`);
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
    const matchPlatform = activePlatforms.includes(job.platform);
    const matchLocation =
      location === '전체 지역' || job.location.includes(location.replace(' 전체', ''));
    const matchStack =
      selectedStacks.length === 0 ||
      selectedStacks.some(s => job.techStacks.includes(s));
    return matchSearch && matchPlatform && matchLocation && matchStack;
  });

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
        activePlatforms={activePlatforms}
        setActivePlatforms={setActivePlatforms}
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
          <StatsCard label="활성 플랫폼" value={activePlatforms.length} />
        </div>

        {/* 공고 리스트 */}
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
                <p className="text-slate-500 font-medium">
                  {activePlatforms.join(', ')} 크롤링 중...
                </p>
                <p className="text-xs text-slate-400">최대 1~2분 소요될 수 있습니다</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <p className="text-red-500 font-semibold">데이터를 불러오는 데 실패했습니다</p>
                <p className="text-sm text-slate-400 max-w-md text-center">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="mt-2 px-4 py-2 bg-[#007bff] text-white rounded-lg text-sm font-medium hover:bg-[#0056b3]"
                >
                  다시 시도
                </button>
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
