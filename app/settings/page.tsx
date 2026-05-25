"use client";

import { useState } from "react";
import Sidebar from "@/app/components/layout/Sidebar";
import Header from "@/app/components/layout/Header";

export default function SettingsPage() {
  const [name, setName] = useState("Kakang Kukung");
  const [role, setRole] = useState("User Analitik");
  const [editMode, setEditMode] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempRole, setTempRole] = useState(role);

  const [cacheSize] = useState("128 MB");
  const [modelCache, setModelCache] = useState(true);
  const [metricsCache, setMetricsCache] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  function handleSaveProfile() {
    setName(tempName);
    setRole(tempRole);
    setEditMode(false);
  }

  function handleCancelEdit() {
    setTempName(name);
    setTempRole(role);
    setEditMode(false);
  }

  async function handleClearCache() {
    setClearingCache(true);
    await new Promise((r) => setTimeout(r, 1200));
    setClearingCache(false);
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <Header />

        <div className="max-w-2xl mx-auto px-8 py-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Settings</h2>

          {/* ── EDIT PROFILE ── */}
          <section className="mb-10">
            <h3 className="text-base font-bold text-gray-800 mb-5">
              Edit Profile
            </h3>

            <div className="space-y-0 divide-y divide-gray-100 border-t border-gray-100">

              {/* Avatar */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-gray-700">Photo</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Foto profil yang ditampilkan di sidebar
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src="/icon/Freak-nail.jpg"
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <button className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    Ganti Foto
                  </button>
                </div>
              </div>

              {/* Nama */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-gray-700">Nama</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Nama yang ditampilkan di aplikasi
                  </p>
                </div>
                {editMode ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 w-48"
                  />
                ) : (
                  <span className="text-sm text-gray-500">{name}</span>
                )}
              </div>


              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                    >
                      Simpan
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setTempName(name);
                      setTempRole(role);
                      setEditMode(true);
                    }}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ── MANAGE CACHE ── */}
          <section>
            <h3 className="text-base font-bold text-gray-800 mb-5">
              Manage Cache
            </h3>

            <div className="space-y-0 divide-y divide-gray-100 border-t border-gray-100">

              {/* Cache size */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-gray-700">Ukuran Cache</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Total cache model dan metrics tersimpan
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                  {cacheCleared ? "0 MB" : cacheSize}
                </span>
              </div>

              {/* Model cache toggle */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-gray-700">Cache Model</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Simpan model terlatih agar tidak perlu retrain ulang
                  </p>
                </div>
                <button
                  onClick={() => setModelCache(!modelCache)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    modelCache ? "bg-teal-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      modelCache ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Metrics cache toggle */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-gray-700">Cache Metrics</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Simpan hasil perhitungan MAE, RMSE, MAPE agar lebih cepat
                  </p>
                </div>
                <button
                  onClick={() => setMetricsCache(!metricsCache)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    metricsCache ? "bg-teal-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      metricsCache ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Clear cache */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-gray-700">Hapus Semua Cache</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Cache akan dihitung ulang saat aplikasi dijalankan kembali
                  </p>
                </div>
                <button
                  onClick={handleClearCache}
                  disabled={clearingCache || cacheCleared}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors ${
                    cacheCleared
                      ? "border-green-200 bg-green-50 text-green-600 cursor-default"
                      : clearingCache
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                  }`}
                >
                  {cacheCleared ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Cache dihapus
                    </>
                  ) : clearingCache ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus Cache
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
