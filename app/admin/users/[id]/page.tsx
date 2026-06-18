'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';
import Link from 'next/link';
import { UserRolesTab } from '@/app/components/admin/UserRolesTab';

interface UserInfo {
  username: string
  email: string
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [userInfo, setUserInfo] = useState<UserInfo>({ username: '...', email: '...' });

  useEffect(() => {
    const savedName = sessionStorage.getItem('ventara_name');
    const savedEmail = sessionStorage.getItem('ventara_email');
    setUserInfo({
      username: savedName || 'User',
      email: savedEmail || '',
    });
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin/users" className="text-gray-400 hover:text-[#00a991] transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">User Roles</h2>
              </div>
              <p className="text-gray-600 text-sm ml-8">Atur roles untuk user ini</p>
            </div>
            <UserRolesTab
              userId={userId}
              username={userInfo.username}
              email={userInfo.email}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
