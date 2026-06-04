'use client';

import { useState, useEffect } from 'react';
import { User } from '@/app/types/admin.types';
import { SearchableSelect } from './SearchableSelect';

interface ResourceTabProps {
  users: User[];
  selectedUserForEdit: User | null;
  onSelectUser: (user: User | null) => void;
  onFinishEditing: () => void;
  userHistory: any[];
  storageUsageBytes: number;
  storageLimitMb: number;
  onSaveStorageLimit: (mb: number) => void;
}

const formatBytes = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

export const ResourceTab = ({
  users,
  selectedUserForEdit,
  onSelectUser,
  onFinishEditing,
  userHistory,
  storageUsageBytes,
  storageLimitMb,
  onSaveStorageLimit,
}: ResourceTabProps) => {
  const [editMb, setEditMb] = useState(storageLimitMb);

  useEffect(() => {
    setEditMb(storageLimitMb);
  }, [storageLimitMb]);
  const usageMb = parseFloat(formatBytes(storageUsageBytes));
  const percent = storageLimitMb > 0 ? Math.min((usageMb / storageLimitMb) * 100, 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Info Banner + User Select */}
      <div className="relative z-10 bg-linear-to-r from-[#e6f6f4] to-[#d9f2ef] backdrop-blur-sm rounded-xl border border-[#00a991]/20 p-4 text-[#007f6d] text-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#00a991]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#00a991]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-medium">
            {selectedUserForEdit
              ? `Mengelola: ${selectedUserForEdit.username}`
              : 'Pilih user untuk melihat aktivitas dan mengatur limit'}
          </p>
        </div>
        <div className="text-gray-400">
          <SearchableSelect
            users={users}
            selectedUser={selectedUserForEdit}
            onSelect={(user) => {
              if (user) onSelectUser(user);
              else onFinishEditing();
            }}
          />
        </div>
      </div>

      {selectedUserForEdit && (
        <>
          {/* Storage Usage Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-md p-5">
            <h3 className="font-semibold text-[#003b33] text-base mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00a991]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Penyimpanan
            </h3>

            <div className="flex items-end justify-between mb-3">
              <div>
                <span className="text-2xl font-bold text-gray-800">{usageMb.toFixed(2)}</span>
                <span className="text-gray-400 text-sm"> / {storageLimitMb.toFixed(2)} MB</span>
              </div>
              <span className={`text-sm font-medium ${percent >= 80 ? 'text-red-500' : 'text-[#00a991]'}`}>
                {percent.toFixed(1)}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percent >= 80 ? 'bg-red-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-[#00a991]'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Batas Storage (MB):</label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="10"
                value={editMb || ''}
                onChange={(e) => setEditMb(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none transition-all"
              />
              <button
                onClick={() => onSaveStorageLimit(editMb)}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-linear-to-r from-[#00a991] to-[#008774] text-white hover:from-[#008774] hover:to-[#006557] transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              >
                Simpan
              </button>
            </div>
          </div>

          {/* History Calculation Cards */}
          {userHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#003b33] text-base mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00a991]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Riwayat Perhitungan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userHistory.slice(0, 6).map((entry: any) => {
                  const hasil = entry.hasil || [];
                  return (
                    <div key={entry.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-md p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-[#00a991] bg-[#e6f6f4] px-2.5 py-0.5 rounded-full">
                          {entry.algo || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-400">{entry.periode || '-'}</span>
                      </div>
                      {hasil.map((h: any, i: number) => (
                        <div key={i} className="text-sm text-gray-700">
                          <span className="font-medium">{h.label}</span> <span className="text-[#00a991] font-semibold">{h.value}</span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-400 mt-2">{entry.waktu || '-'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* History Data List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-md">
            <div className="p-5">
              <h3 className="font-semibold text-[#003b33] text-base mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00a991]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Daftar Histori
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scroll">
                {userHistory.length > 0 ? (
                  userHistory.map((entry: any) => {
                    const hasil = entry.hasil || [];
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-all">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-700 text-sm truncate">
                            {entry.algo || 'Unknown'} • {entry.periode || '-'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {hasil.map((h: any) => `${h.label} ${h.value}`).join(' | ') || entry.file || '-'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{entry.waktu || '-'}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-6 text-sm">Belum ada histori</p>
                )}
              </div>
            </div>
          </div>

          {/* Finish Button */}
          <div className="flex justify-end">
            <button
              onClick={onFinishEditing}
              className="px-5 py-2.5 text-sm font-medium rounded-lg bg-linear-to-r from-[#00a991] to-[#008774] text-white hover:from-[#008774] hover:to-[#006557] transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              Selesai
            </button>
          </div>

          <style jsx global>{`
            .custom-scroll::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scroll::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: #b0e4dd;
              border-radius: 10px;
            }
            .custom-scroll::-webkit-scrollbar-thumb:hover {
              background: #00a991;
            }
          `}</style>
        </>
      )}
    </div>
  );
};
