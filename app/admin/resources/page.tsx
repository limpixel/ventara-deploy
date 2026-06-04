'use client';
import { useState, useEffect } from 'react';
import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';
import { ResourceTab } from '@/app/components/admin/ResourceTab';
import { useAdminData } from '@/app/hooks/useAdminData';
import { User } from '@/app/types/admin.types';

export default function ResourcesPage() {
  const { users, fetchUserData, updateUserStorageLimit } = useAdminData();
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [storageLimitMb, setStorageLimitMb] = useState(10);
  const [storageUsageBytes, setStorageUsageBytes] = useState(0);

  useEffect(() => {
    if (!selectedUserForEdit) {
      setUserHistory([]);
      setStorageUsageBytes(0);
      return;
    }
    const username = selectedUserForEdit.username;
    fetchUserData(username).then((data) => {
      if (!data) return;
      const rawHistory: any[] = data.history || [];
      const history = rawHistory.map((item: any) => item.entry || item);
      setUserHistory(history);
      const bytes = new TextEncoder().encode(JSON.stringify(rawHistory)).length;
      setStorageUsageBytes(bytes);
      setStorageLimitMb(data.storageLimitMb ?? 10);
    });
  }, [selectedUserForEdit]);

  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleSaveStorageLimit = async (mb: number) => {
    if (!selectedUserForEdit) return;
    const username = selectedUserForEdit.username;
    const success = await updateUserStorageLimit(username, mb);
    if (success) {
      setStorageLimitMb(mb);
      setSaveMsg('Batas penyimpanan berhasil diperbarui!');
      setTimeout(() => setSaveMsg(null), 3000);
    } else {
      setSaveMsg('Gagal memperbarui batas penyimpanan.');
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Manage Resources</h2>
              <p className="text-gray-600 text-sm">Kelola pengguna, resource, dan pantau aktivitas sistem</p>
            </div>
            {saveMsg && (
              <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${
                saveMsg.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {saveMsg}
              </div>
            )}
            <ResourceTab
              users={users}
              selectedUserForEdit={selectedUserForEdit}
              onSelectUser={setSelectedUserForEdit}
              onFinishEditing={() => setSelectedUserForEdit(null)}
              userHistory={userHistory}
              storageUsageBytes={storageUsageBytes}
              storageLimitMb={storageLimitMb}
              onSaveStorageLimit={handleSaveStorageLimit}
            />
          </div>
        </div>
      </main>
    </div>
  );
}