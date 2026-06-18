'use client';

import { useState, useEffect } from 'react';
import type { Permission, Resource, Action } from '@/app/types/rbac.types';

const RESOURCES: Resource[] = ['users', 'roles', 'datasets', 'historical_data', 'training_jobs', 'model_registry', 'generation_jobs', 'forecast_results', 'billing', 'system'];
const ACTIONS: Action[] = ['create', 'read', 'update', 'delete', 'manage', 'export'];

export const PermissionsTab = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editPerm, setEditPerm] = useState<Permission | null>(null);
  const [form, setForm] = useState<{ resource: Resource; action: Action; name: string; description: string }>({
    resource: 'datasets', action: 'read', name: '', description: '',
  })
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/admin/permissions');
      if (res.ok) setPermissions(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPermissions(); }, []);

  const handleCreate = async () => {
    const res = await fetch('/api/admin/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ resource: 'datasets', action: 'read', name: '', description: '' });
      fetchPermissions();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create permission');
    }
  };

  const handleUpdate = async () => {
    if (!editPerm) return;
    const res = await fetch(`/api/admin/permissions/${editPerm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, description: form.description }),
    });
    if (res.ok) {
      setEditPerm(null);
      fetchPermissions();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update permission');
    }
  };

  const handleDelete = async (perm: Permission) => {
    if (!confirm(`Delete permission "${perm.resource}:${perm.action}"?`)) return;
    const res = await fetch(`/api/admin/permissions/${perm.id}`, { method: 'DELETE' });
    if (res.ok) fetchPermissions();
    else {
      const data = await res.json();
      setError(data.error || 'Failed to delete permission');
    }
  };

  const groupedByResource = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
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
        <p className="text-sm text-gray-500">{permissions.length} permissions total</p>
        <button
          onClick={() => { setEditPerm(null); setForm({ resource: 'datasets', action: 'read', name: '', description: '' }); setShowCreate(true); }}
          className="px-5 py-2.5 bg-[#00a991] text-white rounded-xl hover:bg-[#008774] transition-all text-sm font-medium shadow-md hover:shadow-lg"
        >
          + Create Permission
        </button>
      </div>

      {Object.entries(groupedByResource).map(([resource, perms]) => (
        <div key={resource} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-linear-to-r from-[#e6f6f4]/30 to-transparent border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#007f6d] uppercase tracking-wider">{resource}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {perms.map((perm) => (
                  <tr key={perm.id} className="border-b border-gray-50 hover:bg-[#e6f6f4]/30 transition-all">
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-mono font-bold ${
                        perm.action === 'manage' ? 'bg-purple-100 text-purple-700' :
                        perm.action === 'create' ? 'bg-green-100 text-green-700' :
                        perm.action === 'read' ? 'bg-blue-100 text-blue-700' :
                        perm.action === 'update' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {perm.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{perm.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{perm.description || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditPerm(perm); setForm({ resource: perm.resource, action: perm.action, name: perm.name || '', description: perm.description || '' }); setShowCreate(true); }}
                          className="p-2 text-gray-400 hover:text-[#00a991] hover:bg-[#e6f6f4] rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(perm)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editPerm ? 'Edit Permission' : 'Create Permission'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource *</label>
                <select
                  value={form.resource}
                  onChange={e => setForm({ ...form, resource: e.target.value as Resource })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none"
                  disabled={!!editPerm}
                >
                  {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action *</label>
                <select
                  value={form.action}
                  onChange={e => setForm({ ...form, action: e.target.value as Action })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none"
                  disabled={!!editPerm}
                >
                  {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none"
                  placeholder="e.g. View users list"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00a991]/40 focus:border-[#00a991] outline-none resize-none"
                  rows={2}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowCreate(false); setEditPerm(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                Cancel
              </button>
              <button onClick={editPerm ? handleUpdate : handleCreate} className="px-5 py-2 bg-[#00a991] text-white rounded-xl hover:bg-[#008774] transition-all">
                {editPerm ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
