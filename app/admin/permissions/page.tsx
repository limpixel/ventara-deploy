'use client';
import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';
import { PermissionsTab } from '@/app/components/admin/PermissionsTab';

export default function PermissionsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Permission Manager</h2>
              <p className="text-gray-600 text-sm">Kelola resource permissions untuk sistem RBAC</p>
            </div>
            <PermissionsTab />
          </div>
        </div>
      </main>
    </div>
  );
}
