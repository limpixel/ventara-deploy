'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type AuthView = 'landing' | 'register' | 'login';

const USERS = [
  { username: "user", password: "user123", role: "user", name: "Kakang Kukung" },
  { username: "admin", password: "admin123", role: "admin", name: "Administrator" },
];

export function useAuth() {
  const router = useRouter();
  const [view, setView] = useState<AuthView>('landing');
  const [isError, setIsError] = useState(false);

  const handleLogin = (username: string, password: string) => {
    const found = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!found) {
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
      return;
    }

    localStorage.setItem("ventara_role", found.role);
    localStorage.setItem("ventara_name", found.name);

    router.push(found.role === "admin" ? "/admin/dashboard" : "/forecasting");
  };

  const handleRegister = (username: string, email: string, password: string) => {
    if (!username || !email || !password) {
      alert('⚠️ All fields are required.');
      return;
    }
    if (!email.includes('@')) {
      alert('📧 Invalid email.');
      return;
    }
    if (password.length < 4) {
      alert('🔒 Password minimum 4 characters.');
      return;
    }
    alert(`🎉 Welcome ${username}! Please login.`);
    setView('login');
  };

  const handleForgotPassword = () => {
    alert('📩 Reset password feature coming soon.');
  };

  return {
    view,
    setView,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    isError,
  };
}