import React from 'react';
import { MapPin, ExternalLink, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { JobPosting } from '../types';

interface JobCardProps {
  job: JobPosting;
  index: number;
}

const PLATFORM_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  '원티드': { bg: '#007bff', text: 'white', label: 'W' },
  'Wanted': { bg: '#007bff', text: 'white', label: 'W' },
  '로켓펀치': { bg: '#f97316', text: 'white', label: 'R' },
  '사람인': { bg: '#ef4444', text: 'white', label: 'S' },
  '잡코리아': { bg: '#8b5cf6', text: 'white', label: 'J' },
};

export default function JobCard({ job, index }: JobCardProps) {
  const platformInfo = PLATFORM_COLORS[job.platform] ?? { bg: '#64748b', text: 'white', label: '?' };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-[#007bff]/30 transition-all group"
    >
      <div className="flex gap-6">
        {/* 회사 로고 */}
        <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] text-slate-400 text-center px-1 font-medium leading-tight">회사<br />로고</span>
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-[#007bff] transition-colors truncate">
                {job.title}
              </h3>
              <div className="flex items-center text-sm text-slate-500 gap-2 mb-3 flex-wrap">
                <span className="font-semibold text-slate-700">{job.company}</span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {job.location}
                </span>
              </div>
            </div>
            {/* 플랫폼 배지 */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 flex-shrink-0">
              <div
                className="w-4 h-4 rounded-sm flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: platformInfo.bg, color: platformInfo.text }}
              >
                {platformInfo.label}
              </div>
              <span className="text-xs font-medium text-slate-500">{job.platform}</span>
            </div>
          </div>

          {/* 기술 스택 태그 */}
          {job.techStacks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.techStacks.map(stack => (
                <span key={stack} className="text-[11px] font-bold text-[#007bff] bg-[#e6f2ff] px-2 py-0.5 rounded">
                  #{stack}
                </span>
              ))}
            </div>
          )}

          {/* AI 요약 */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100/50 relative">
            <div className="absolute -top-2 left-4 px-2 bg-white border border-slate-100 rounded text-[10px] font-bold text-slate-400">
              AI 요약
            </div>
            <p className="text-sm text-slate-600">
              {job.company}에서 역량 있는 <strong>{job.title}</strong> 개발자를 모집합니다. 상세 공고를 확인하고 지원해 보세요.
            </p>
          </div>
        </div>

        {/* 우측 액션 */}
        <div className="flex flex-col justify-between items-end flex-shrink-0">
          <span className="text-xs text-slate-400">등록일: {job.postedAt}</span>
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-xl border border-slate-200 hover:border-[#007bff]/40 hover:bg-[#e6f2ff] text-slate-400 hover:text-[#007bff] transition-all">
              <Star className="h-5 w-5" />
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-[#007bff] hover:bg-[#0056b3] text-white font-bold rounded-xl transition-colors shadow-md shadow-[#007bff]/10 flex items-center gap-2"
            >
              지원하기 <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
