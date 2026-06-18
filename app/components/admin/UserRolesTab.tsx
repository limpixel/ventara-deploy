'use client';

import { useState, useEffect } from 'react';
import type { Role } from '@/app/types/rbac.types';

interface UserRolesTabProps {
  userId: string
  username: string
  email: string
}

export const UserRolesTab = ({ userId, username, email }: UserRolesTabProps) => {
  const [assignedRoles, setAssignedRoles] = useState<Role[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, userRolesRes] = await Promise.all([
        fetch('/api/admin/roles'),
        fetch(`/api/admin/users/${userId}/roles`),
      ]);
      if (rolesRes.ok) {
        const all: Role[] = await rolesRes.json();
        setAllRoles(all.filter(r => r.is_active));
      }
      if (userRolesRes.ok) {
        setAssignedRoles(await userRolesRes.json());
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const assignRole = async () => {
    if (!selectedRoleId) return;
    setMessage('');
    const res = await fetch(`/api/admin/users/${userId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: selectedRoleId }),
    });
    if (res.ok) {
      setSelectedRoleId('');
      fetchData();
      setMessage('Role assigned successfully');
    } else {
      const data = await res.json();
      setMessage(data.error || 'Failed to assign role');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const revokeRole = async (roleId: string) => {
    setMessage('');
    const res = await fetch(`/api/admin/users/${userId}/roles`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: roleId }),
    });
    if (res.ok) {
      fetchData();
      setMessage('Role revoked successfully');
    } else {
      const data = await res.json();
      setMessage(data.error || 'Failed to revoke role');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const unassignedRoles = allRoles.filter(r => !assignedRoles.some(ar => ar.id === r.id));

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${
          message.includes('successfully')
            ? 'bg-green-50 text-green-600 border-green-200'
            : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#00a991]/20 to-[#008774]/20 flex items-center justify-center text-lg font-bold text-[#00a991]">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{username}</h3>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>
      </div>

      {/* Current Roles */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
        <h4 className="text-sm font-bold text-gray-700 mb-4">Current Roles</h4>
        {assignedRoles.length === 0 ? (
          <p className="text-gray-400 text-sm">No roles assigned</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {assignedRoles.map((role) => (
              <div key={role.id} className="flex items-center gap-2 bg-[#e6f6f4] text-[#00a991] px-4 py-2 rounded-xl border border-[#00a991]/20">
                <div>
                  <span className="font-medium text-sm">{role.display_name}</span>
                  <span className="text-xs ml-2 opacity-60 font-mono">({role.name})</span>
                </div>
                <button
                  onClick={() => revokeRole(role.id)}
                  className="ml-1 p-0.5 hover:bg-red-100 hover:text-red-500 rounded-full transition-all"
                  title="Revoke role"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Role */}
      {unassignedRoles.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Assign New Role</h4>
          <div className="flex gap-3">
            <select
              value={selectedRoleId}
              onChange={e => setSelectedRoleId(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none text-sm"
            >
              <option value="">Select a role...</option>
              {unassignedRoles.map(r => (
                <option key={r.id} value={r.id}>{r.display_name} ({r.name})</option>
              ))}
            </select>
            <button
              onClick={assignRole}
              disabled={!selectedRoleId}
              className="px-5 py-2.5 bg-[#00a991] text-white rounded-xl hover:bg-[#008774] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
