'use client';

import { useState, useEffect } from 'react';
import type { Role, Permission } from '@/app/types/rbac.types';

export const RolesTab = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: '', display_name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) setRoles(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/admin/permissions');
      if (res.ok) setPermissions(await res.json());
    } catch {}
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const res = await fetch(`/api/admin/roles/${roleId}/permissions`);
      if (res.ok) {
        const perms: Permission[] = await res.json();
        setRolePermissions(perms.map(p => p.id));
      }
    } catch {}
  };

  useEffect(() => { fetchRoles(); fetchPermissions(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.display_name) return;
    const res = await fetch('/api/admin/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreateModal(false);
      setForm({ name: '', display_name: '', description: '' });
      fetchRoles();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create role');
    }
  };

  const handleUpdate = async () => {
    if (!editRole) return;
    const res = await fetch(`/api/admin/roles/${editRole.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditRole(null);
      setForm({ name: '', display_name: '', description: '' });
      fetchRoles();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update role');
    }
  };

  const handleToggleActive = async (role: Role) => {
    await fetch(`/api/admin/roles/${role.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...role, is_active: !role.is_active }),
    });
    fetchRoles();
  };

  const handleDelete = async (role: Role) => {
    if (role.is_system) {
      setError('Cannot delete system role');
      return;
    }
    if (!confirm(`Delete role "${role.display_name}"?`)) return;
    await fetch(`/api/admin/roles/${role.id}`, { method: 'DELETE' });
    fetchRoles();
  };

  const openPermModal = (role: Role) => {
    setSelectedRole(role);
    fetchRolePermissions(role.id);
    setShowPermModal(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permission_ids: rolePermissions }),
    });
    setShowPermModal(false);
    setSelectedRole(null);
  };

  const togglePermission = (permId: string) => {
    setRolePermissions(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const openEdit = (role: Role) => {
    setEditRole(role);
    setForm({ name: role.name, display_name: role.display_name, description: role.description || '' });
  };

  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = [];
    acc[p.resource].push(p);
    return acc;
  }, {});

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-200">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{roles.length} roles total</p>
        <button
          onClick={() => { setEditRole(null); setForm({ name: '', display_name: '', description: '' }); setShowCreateModal(true); }}
          className="px-5 py-2.5 bg-[#00a991] text-white rounded-xl hover:bg-[#008774] transition-all text-sm font-medium shadow-md hover:shadow-lg"
        >
          + Create Role
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200">
            <thead>
              <tr className="border-b border-gray-100 bg-linear-to-r from-[#e6f6f4]/30 to-transparent">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#007f6d] uppercase tracking-wider">Role Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#007f6d] uppercase tracking-wider">Display Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#007f6d] uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#007f6d] uppercase tracking-wider">System</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#007f6d] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#007f6d] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-gray-50 hover:bg-[#e6f6f4]/30 transition-all">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-gray-700">{role.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{role.display_name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">{role.description || '-'}</td>
                  <td className="px-6 py-4">
                    {role.is_system ? (
                      <span className="text-[#00a991] text-xs font-medium">System</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      role.is_active
                        ? 'bg-[#e6f6f4] text-[#00a991] border border-[#00a991]/30'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${role.is_active ? 'bg-[#00a991] animate-pulse' : 'bg-gray-400'}`} />
                      {role.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openPermModal(role)} className="p-2 text-gray-400 hover:text-[#00a991] hover:bg-[#e6f6f4] rounded-lg transition-all" title="Manage Permissions">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </button>
                      <button onClick={() => openEdit(role)} className="p-2 text-gray-400 hover:text-[#00a991] hover:bg-[#e6f6f4] rounded-lg transition-all" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleToggleActive(role)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Toggle Active">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={role.is_active ? "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" : "M5 13l4 4L19 7"} />
                        </svg>
                      </button>
                      {!role.is_system && (
                        <button onClick={() => handleDelete(role)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editRole) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editRole ? 'Edit Role' : 'Create Role'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none"
                  placeholder="e.g. editor"
                  disabled={!!editRole}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                <input
                  value={form.display_name}
                  onChange={e => setForm({ ...form, display_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none"
                  placeholder="e.g. Editor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none resize-none"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowCreateModal(false); setEditRole(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={editRole ? handleUpdate : handleCreate} className="px-5 py-2 bg-[#00a991] text-white rounded-xl hover:bg-[#008774] transition-all">
                {editRole ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermModal && selectedRole && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Permissions for <span className="text-[#00a991]">{selectedRole.display_name}</span></h3>
            <p className="text-sm text-gray-400 mb-4">Select permissions to assign to this role</p>

            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource} className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">{resource}</h4>
                <div className="flex flex-wrap gap-2">
                  {perms.map(perm => {
                    const isChecked = rolePermissions.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isChecked
                            ? 'bg-[#e6f6f4] text-[#00a991] border-[#00a991]/40 shadow-sm'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {perm.action}
                        {perm.name && <span className="ml-1 opacity-60">({perm.name})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setShowPermModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={handleSavePermissions} className="px-5 py-2 bg-[#00a991] text-white rounded-xl hover:bg-[#008774] transition-all">
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
