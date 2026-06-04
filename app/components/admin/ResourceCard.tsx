'use client';

import { ResourceLimit } from '@/app/types/admin.types';

interface ResourceCardProps {
  limit: ResourceLimit;
  userLimit: { maxStorageMb: number };
  isCustomMode: boolean;
  onDailyChange: (value: number) => void;
  onMonthlyChange: (value: number) => void;
}

export const ResourceCard = ({ 
  limit, 
  userLimit, 
  isCustomMode, 
  onDailyChange, 
  onMonthlyChange 
}: ResourceCardProps) => {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-linear-to-r from-[#00a991] to-[#008774]" />
              <h3 className="font-semibold text-gray-800 text-base">{limit.featureName}</h3>
            </div>
            <p className="text-xs text-gray-400 ml-3">{limit.description}</p>
          </div>
          {isCustomMode && (
            <div className="text-[11px] text-[#00a991] bg-[#e6f6f4] px-2.5 py-1 rounded-full font-medium">
              Custom
            </div>
          )}
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Batas Penyimpanan (MB)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={userLimit.maxStorageMb}
              onChange={(e) => onDailyChange(parseFloat(e.target.value) || 0)}
              className="w-28 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white/50 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none transition-all"
            />
            <span className="text-sm text-gray-400">MB</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Maksimal 10 MB. Setiap proses ±2-3 MB.</p>
        </div>
      </div>
    </div>
  );
};