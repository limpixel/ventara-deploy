'use client';

import { useState, useRef, useEffect } from 'react';
import { User } from '@/app/types/admin.types';

interface SearchableSelectProps {
  users: User[];
  selectedUser: User | null;
  onSelect: (user: User | null) => void;
}

export const SearchableSelect = ({ users, selectedUser, onSelect }: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = users.filter(u =>
    u.isActive && u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (user: User | null) => {
    onSelect(user);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-w-[240px] px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-left hover:border-[#00a991]/40 focus:outline-none focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] transition-all"
      >
        <span className={selectedUser ? 'text-gray-700 font-medium' : 'text-gray-400'}>
          {selectedUser ? selectedUser.username : '-- Pilih user untuk custom limit --'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Cari user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991]"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {selectedUser && (
              <button
                onClick={() => handleSelect(null)}
                className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Kembali ke limit default
              </button>
            )}
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">User tidak ditemukan</p>
            ) : (
              filtered.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[#e6f6f4] transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-[#e6f6f4] text-[#00a991] font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#00a991]/10 flex items-center justify-center text-xs font-bold text-[#00a991]">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.username}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
