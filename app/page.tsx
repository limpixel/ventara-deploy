"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const USERS = [
  { username: "user", password: "user123", role: "user", name: "Kakang Kukung" },
  { username: "admin", password: "admin123", role: "admin", name: "Administrator" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const found = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!found) {
      setError("Username atau password salah");
      return;
    }

    setLoading(true);
    localStorage.setItem("ventara_role", found.role);
    localStorage.setItem("ventara_name", found.name);

    setTimeout(() => {
      router.push(found.role === "admin" ? "/admin/dashboard" : "/forecasting");
    }, 800);
  }


   return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-teal-700">Ventara Forecast</h1>
          <p className="text-sm text-gray-500 mt-2">Sistem Peramalan Energi Angin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-teal-500 text-black"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 transition-colors text-white font-semibold py-3 rounded-xl"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}