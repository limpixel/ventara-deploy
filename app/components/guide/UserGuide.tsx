'use client';

import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEffect, useRef, useState } from 'react';

const themeColors = {
  primary: '#14b8a6',
  primaryDark: '#0d9488',
  primaryLight: '#ccfbf1',
  secondary: '#f59e0b',
  success: '#14b8a6',
  successDark: '#0d9488',
  textDark: '#1f2937',
  textMedium: '#4b5563',
  textLight: '#9ca3af',
  background: '#ffffff',
  backgroundLight: '#f0fdf4',
};

interface GuideStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
  };
}

const getStepsByPath = (path: string): GuideStep[] => {
  const steps: Record<string, GuideStep[]> = {
    '/': [
      {
        element: '#welcome-ventara',
        popover: {
          title: '👋 Selamat Datang di Ventara',
          description: 'Dashboard prediksi energi angin untuk wilayah pesisir Indonesia. Mari kita pelajari fitur-fiturnya!',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#algorithm-select',
        popover: {
          title: '🤖 Pilih Algoritma Machine Learning',
          description: 'Pilih algoritma ML: General (semua model) atau Best 2 Model (XGBoost & LSTM) untuk hasil prediksi terbaik dengan akurasi hingga 95%.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.bg-amber-50',
        popover: {
          title: '🏆 Model Terbaik - XGBoost',
          description: 'XGBoost adalah model dengan performa terbaik. Metrik yang ditampilkan: MAE, RMSE, MAPE, dan R².',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '.bg-amber-50:last-child',
        popover: {
          title: '🥈 Model Deep Learning Terbaik',
          description: 'LSTM adalah model DL terbaik untuk prediksi time series angin.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '.bg-teal-50',
        popover: {
          title: '📊 Ringkasan Prediksi AI',
          description: 'Ringkasan hasil prediksi yang dihasilkan AI. Klik "Overall View" untuk detail lengkap.',
          side: 'bottom',
          align: 'start',
        },
      },
    ],
    '/analitik': [
      {
        element: '#location-search',
        popover: {
          title: '🔍 Cari Lokasi',
          description: 'Ketik nama kota atau pulau untuk melihat prakiraan angin di wilayah tersebut.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#map-container',
        popover: {
          title: '🗺️ Peta Interaktif',
          description: 'Visualisasi peta lokasi dengan radius 16 km. Anda dapat drag dan zoom peta.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#wind-cards',
        popover: {
          title: '💨 Prediksi Kecepatan Angin 7 Hari',
          description: 'Kartu prediksi kecepatan angin maksimum untuk 7 hari ke depan. Geser ke kanan/kiri.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#weather-cards',
        popover: {
          title: '🌤️ Prakiraan Cuaca & Suhu',
          description: 'Informasi cuaca lengkap. Klik "Detail & Analisis" untuk melihat status risiko BMKG.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#daily-tab',
        popover: {
          title: '📅 Tab Daily',
          description: 'Tampilan ringkasan prediksi harian untuk kecepatan angin dan cuaca.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#trends-tab',
        popover: {
          title: '📈 Tab Trends',
          description: 'Grafik tren suhu, kelembapan, dan kecepatan angin.',
          side: 'bottom',
          align: 'start',
        },
      },
    ],
    '/trends-reports': [
      {
        element: 'main',
        popover: {
          title: '📊 Trends Reports',
          description: 'Halaman ini menampilkan laporan tren lengkap untuk analisis energi angin jangka panjang.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#period-selector',
        popover: {
          title: '📅 Pilih Periode Waktu',
          description: 'Pilih periode waktu yang ingin dianalisis: Bulanan, Triwulan, Semester, atau Tahunan.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#metric-selector',
        popover: {
          title: '📈 Pilih Metrik Analisis',
          description: 'Pilih metrik: Kecepatan Angin Rata-rata, Maksimum, atau Potensi Energi (kWh).',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#trend-chart',
        popover: {
          title: '📉 Grafik Tren Interaktif',
          description: 'Hover pada titik data untuk melihat nilai detail. Anda dapat zoom dan pan pada grafik.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#comparison-chart',
        popover: {
          title: '🔄 Grafik Perbandingan',
          description: 'Perbandingan antar periode untuk analisis musiman dan tahunan.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#export-buttons',
        popover: {
          title: '💾 Ekspor Data',
          description: 'Ekspor laporan tren dalam format CSV, Excel, atau PDF.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#insights-panel',
        popover: {
          title: '💡 Wawasan AI',
          description: 'Insight otomatis dari AI tentang pola tren, anomali, dan rekomendasi.',
          side: 'top',
          align: 'start',
        },
      },
    ],
    '/analytics': [
      {
        element: 'main',
        popover: {
          title: '📈 Analytics Dashboard',
          description: 'Dashboard analitik lengkap untuk evaluasi performa model prediksi.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#model-comparison',
        popover: {
          title: '🤖 Perbandingan Performa Model',
          description: 'Perbandingan semua model berdasarkan MAPE, RMSE, dan R².',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#accuracy-chart',
        popover: {
          title: '📊 Grafik Akurasi Prediksi',
          description: 'Tingkat akurasi setiap model. XGBoost dan LSTM umumnya tertinggi.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#error-distribution',
        popover: {
          title: '📉 Distribusi Error',
          description: 'Visualisasi distribusi error prediksi menggunakan histogram.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#time-series-analysis',
        popover: {
          title: '🕐 Analisis Time Series',
          description: 'Prediksi vs aktual dari waktu ke waktu. Melihat pola musiman.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#feature-importance',
        popover: {
          title: '⭐ Feature Importance',
          description: 'Fitur yang paling berpengaruh terhadap prediksi kecepatan angin.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#residual-plot',
        popover: {
          title: '📐 Residual Plot',
          description: 'Plot residual untuk memeriksa homogenitas varians.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '#download-report',
        popover: {
          title: '📥 Download Laporan Lengkap',
          description: 'Unduh laporan analitik lengkap dalam format PDF.',
          side: 'top',
          align: 'start',
        },
      },
    ],
    '/historis': [
      {
        element: '#search-history',
        popover: {
          title: '🔍 Filter & Cari Riwayat',
          description: 'Cari berdasarkan algoritma atau nama file.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#total-stats',
        popover: {
          title: '📊 Statistik Total',
          description: 'Jumlah total perhitungan yang tersimpan.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#history-table',
        popover: {
          title: '📋 Tabel Riwayat',
          description: 'Semua riwayat prediksi dengan detail lengkap.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '.action-view',
        popover: {
          title: '👁️ Lihat Detail',
          description: 'Lihat detail prediksi di halaman Overview.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '.action-delete',
        popover: {
          title: '🗑️ Hapus Riwayat',
          description: 'Hapus riwayat yang tidak diperlukan.',
          side: 'top',
          align: 'start',
        },
      },
    ],
    '/overview': [
      {
        element: '.bg-gradient-to-r.from-teal-50',
        popover: {
          title: '🏆 Performa Model XGBoost',
          description: 'Model dengan akurasi tertinggi. MAPE semakin kecil semakin baik.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.bg-white.rounded-xl.border',
        popover: {
          title: '📈 Grafik Perbandingan',
          description: 'Perbandingan XGBoost, LSTM, dan data aktual selama 7 hari.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'table',
        popover: {
          title: '📊 Tabel Perbandingan',
          description: 'Perbandingan semua model dengan metrik MAPE, RMSE, dan R².',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'button.bg-teal-500',
        popover: {
          title: '💾 Simpan ke Riwayat',
          description: 'Simpan hasil prediksi ke halaman Historis.',
          side: 'top',
          align: 'start',
        },
      },
    ],
    '/settings': [
      {
        element: '.flex.gap-3.mb-6 button:first-child',
        popover: {
          title: '👤 Pengaturan Profil',
          description: 'Kelola informasi profil Anda.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.flex.gap-3.mb-6 button:last-child',
        popover: {
          title: '💾 Manajemen Cache',
          description: 'Lihat dan kelola data cache riwayat perhitungan.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.w-24.h-24',
        popover: {
          title: '🖼️ Foto Profil',
          description: 'Upload foto profil dengan mengklik ikon kamera.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.bg-gradient-to-r.from-teal-400.to-teal-500',
        popover: {
          title: '💳 Upgrade Penyimpanan',
          description: 'Tingkatkan paket penyimpanan untuk kapasitas lebih besar.',
          side: 'top',
          align: 'start',
        },
      },
    ],
    '/data-cache': [
      {
        element: 'main',
        popover: {
          title: '💾 Manajemen Data Cache',
          description: 'Kelola semua data cache dari riwayat perhitungan prediksi.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: 'input[type="text"]',
        popover: {
          title: '🔍 Filter Cache',
          description: 'Cari cache berdasarkan nama file, algoritma, atau waktu.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.min-w-\\[180px\\].bg-gradient-to-r',
        popover: {
          title: '📊 Total Penggunaan Cache',
          description: 'Total ukuran cache yang tersimpan.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: 'button:contains("Upgrade")',
        popover: {
          title: '⬆️ Upgrade Penyimpanan',
          description: 'Tingkatkan paket penyimpanan untuk kapasitas lebih besar.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'button:contains("Hapus Semua")',
        popover: {
          title: '🗑️ Hapus Semua Cache',
          description: 'Hapus semua data cache. Tindakan ini tidak dapat dibatalkan.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '.w-full.bg-gray-200.rounded-full',
        popover: {
          title: '📈 Indikator Penggunaan',
          description: 'Persentase penggunaan penyimpanan.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'table',
        popover: {
          title: '📋 Daftar Cache',
          description: 'Semua cache dengan detail waktu, file, algoritma, dan hasil prediksi.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'button:has(svg:first-child)',
        popover: {
          title: '📤 Ekspor & Hapus',
          description: 'Download cache ke CSV atau hapus cache tertentu.',
          side: 'left',
          align: 'start',
        },
      },
    ],
    // ==================== ADMIN PANEL GUIDE ====================
    '/admin': [
      {
        element: '.max-w-7xl.mx-auto',
        popover: {
          title: '👋 Selamat Datang di Admin Panel Ventara',
          description: 'Panel administrasi untuk mengelola pengguna, resource limits, dan memantau aktivitas sistem secara real-time.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.md\\:grid-cols-3.gap-4',
        popover: {
          title: '📊 Dashboard Overview',
          description: 'Lihat statistik cepat: Total Pengguna Aktif, Pengguna Aktif Hari Ini, dan Total Penggunaan Hari Ini.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.md\\:grid-cols-3.gap-4 > div:first-child',
        popover: {
          title: '📈 Kartu Statistik - Total Pengguna',
          description: 'Menampilkan jumlah total pengguna aktif yang terdaftar di sistem.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.md\\:grid-cols-3.gap-4 > div:nth-child(2)',
        popover: {
          title: '📈 Kartu Statistik - Pengguna Aktif Hari Ini',
          description: 'Jumlah pengguna yang menggunakan sistem hari ini.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.md\\:grid-cols-3.gap-4 > div:nth-child(3)',
        popover: {
          title: '📈 Kartu Statistik - Total Penggunaan Hari Ini',
          description: 'Total penggunaan fitur oleh semua pengguna hari ini.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-6 > div:first-child',
        popover: {
          title: '📍 Top Lokasi Penggunaan',
          description: 'Lihat 5 lokasi dengan aktivitas penggunaan tertinggi. Data ini membantu analisis sebaran geografis pengguna.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-6 > div:last-child',
        popover: {
          title: '🕐 Aktivitas Terakhir',
          description: 'Pantau 10 aktivitas terakhir dari semua pengguna. Setiap aktivitas mencatat username, fitur yang digunakan, lokasi, dan waktu.',
          side: 'right',
          align: 'start',
        },
      },
    ],
    // ==================== ADMIN RESOURCE TAB GUIDE ====================
    '/admin?tab=resource': [
      {
        element: '.max-w-7xl.mx-auto',
        popover: {
          title: '⚙️ Resource Manager',
          description: 'Kelola batasan penggunaan fitur untuk semua pengguna atau per individu. Bisa diatur per hari dan per bulan.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.bg-gradient-to-r.from-\\[\\#e6f6f4\\].to-\\[\\#d9f2ef\\]',
        popover: {
          title: '🔧 Informasi Mode',
          description: 'Menampilkan mode pengeditan saat ini - apakah mengatur default untuk semua pengguna atau custom untuk user tertentu.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: 'select',
        popover: {
          title: '👤 Pilih User untuk Custom Limit',
          description: 'Pilih user tertentu untuk memberikan batasan khusus yang berbeda dari default. Cocok untuk VIP user atau trial premium.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-5 > div:first-child',
        popover: {
          title: '🎯 Batasan per Fitur - Forecasting',
          description: 'Atur batas penggunaan untuk fitur Forecasting / Prediksi. Daily limit dan monthly limit dapat disesuaikan.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-5 > div:nth-child(2)',
        popover: {
          title: '🎯 Batasan per Fitur - Report Analytics',
          description: 'Atur batas penggunaan untuk fitur Report Analytics.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-5 > div:nth-child(3)',
        popover: {
          title: '🎯 Batasan per Fitur - Trends Reports',
          description: 'Atur batas penggunaan untuk fitur Trends Reports.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: '.grid.grid-cols-1.lg\\:grid-cols-2.gap-5 > div:nth-child(4)',
        popover: {
          title: '🎯 Batasan per Fitur - Export Data',
          description: 'Atur batas penggunaan untuk fitur Export Data.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'input[type="number"]:first-of-type',
        popover: {
          title: '📅 Batas Harian',
          description: 'Jumlah maksimum penggunaan fitur per hari. Masukkan angka 0 untuk tidak membatasi.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'input[type="number"]:last-of-type',
        popover: {
          title: '📆 Batas Bulanan',
          description: 'Jumlah maksimum penggunaan fitur per bulan. Masukkan angka 0 untuk tidak membatasi.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'button:contains("Selesai")',
        popover: {
          title: '✅ Selesai Edit',
          description: 'Klik tombol ini setelah selesai mengedit custom limit untuk user tertentu.',
          side: 'top',
          align: 'start',
        },
      },
    ],
    // ==================== ADMIN USERS TAB GUIDE ====================
    '/admin?tab=users': [
      {
        element: '.max-w-7xl.mx-auto',
        popover: {
          title: '👥 User Manager',
          description: 'Kelola semua pengguna terdaftar. Cari, edit limit, aktifkan/nonaktifkan akun, dan pantau penggunaan.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: 'input[type="text"]',
        popover: {
          title: '🔍 Pencarian Pengguna',
          description: 'Cari pengguna berdasarkan username atau email. Filter cepat untuk menemukan user tertentu.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: 'table',
        popover: {
          title: '📋 Tabel Pengguna',
          description: 'Daftar lengkap semua pengguna dengan informasi: status aktif, tanggal registrasi, total penggunaan, dan penggunaan hari ini.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'tbody tr:first-child td:first-child',
        popover: {
          title: '👤 Data Pengguna',
          description: 'Menampilkan username dan inisial pengguna untuk identifikasi cepat.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: 'tbody tr:first-child td:nth-child(5)',
        popover: {
          title: '📊 Statistik Penggunaan',
          description: 'Total penggunaan sepanjang masa dan penggunaan hari ini untuk setiap pengguna.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'tbody tr:first-child td:nth-child(6) span',
        popover: {
          title: '🟢 Status Akun',
          description: 'Status aktif/nonaktif akun. Akun nonaktif tidak bisa login dan menggunakan sistem.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: 'tbody tr:first-child button:first-child',
        popover: {
          title: '✏️ Edit Batasan Pengguna',
          description: 'Klik ikon pensil untuk mengatur custom limit untuk user tertentu. Batasan ini akan override default limit.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: 'tbody tr:first-child button:last-child',
        popover: {
          title: '🚫 Nonaktifkan Akun',
          description: 'Nonaktifkan akun pengguna. User tidak akan bisa login dan menggunakan sistem. Dapat diaktifkan kembali kapan saja.',
          side: 'left',
          align: 'start',
        },
      },
    ],
  };

  // Handle dynamic paths with query params
  if (path === '/admin') {
    return steps['/admin'] || [];
  }
  if (path === '/admin' && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'resource') {
      return steps['/admin?tab=resource'] || [];
    }
    if (tab === 'users') {
      return steps['/admin?tab=users'] || [];
    }
  }
  
  return steps[path] || [];
};

// ─── Page route map for sidebar buttons ──────────────────────────────────────
const PAGE_ROUTES: Record<string, { label: string; icon: string }> = {
  '/': { label: 'Dashboard', icon: '🏠' },
  '/analitik': { label: 'Analitik', icon: '🗺️' },
  '/trends-reports': { label: 'Trends Reports', icon: '📊' },
  '/analytics': { label: 'Analytics', icon: '📈' },
  '/historis': { label: 'Historis', icon: '📋' },
  '/overview': { label: 'Overview', icon: '🔍' },
  '/settings': { label: 'Settings', icon: '⚙️' },
  '/data-cache': { label: 'Data Cache', icon: '💾' },
  '/admin': { label: 'Admin Panel', icon: '🛡️' },
  '/admin/users': { label: 'User Manager', icon: '👥' },
  '/admin/resource': { label: 'Resource Manager', icon: '⚙️' },
};

// ─── shared driver config factory ────────────────────────────────────────────
const buildDriver = (
  onDestroy: () => void,
  onClose?: () => void,
) =>
  driver({
    showProgress: false,
    nextBtnText: 'Selanjutnya',
    prevBtnText: 'Sebelumnya',
    doneBtnText: 'Selesai',
    animate: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.25)',
    stagePadding: 10,
    stageRadius: 12,
    onDestroyStarted: onDestroy,
    onCloseClick: onClose,
    onHighlightStarted: (element) => {
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    popoverClass: 'driverjs-theme-custom',
  });

// ─── Global styles (injected once) ───────────────────────────────────────────
const GUIDE_STYLES = `
  aside,
  header,
  .sidebar,
  [class*="sidebar"],
  [class*="Sidebar"],
  nav.w-64,
  nav.bg-white.border-r,
  .fixed.inset-y-0.left-0,
  .fixed.left-0.top-0.h-full {
    z-index: 9999 !important;
    position: relative !important;
    background-color: inherit !important;
    filter: none !important;
    opacity: 1 !important;
  }

  /* Pastikan sidebar items TIDAK mendapat highlight/glow */
  body.driver-active aside *,
  body.driver-active nav * {
    box-shadow: none !important;
    outline: none !important;
  }
  
  main, 
  .main-content,
  [role="main"],
  .container.mx-auto,
  .p-6,
  .p-8 {
    position: relative !important;
    z-index: 9997 !important;
  }
  
  body.driver-active main,
  body.driver-active .main-content,
  body.driver-active [role="main"],
  body.driver-active .container.mx-auto {
    z-index: 9997 !important;
  }
  
  .driver-popover {
    z-index: 10002 !important;
    position: fixed !important;
  }
  
  .driver-popover.welcome-popover {
    left: 24px !important;
    right: auto !important;
    top: 80px !important;
    bottom: auto !important;
    transform: none !important;
    max-width: 340px !important;
  }
  
  .driver-popover[data-side="top"][data-align="start"] {
    left: 24px !important;
    right: auto !important;
    top: 80px !important;
    bottom: auto !important;
    transform: none !important;
  }
  
  .fixed.bottom-6.right-6 { 
    z-index: 10003 !important; 
  }
  
  /* Popover card — shadow lebih terang/soft */
  .driverjs-theme-custom {
    background-color: #ffffff !important;
    border-radius: 20px !important;
    box-shadow: 0 8px 28px -4px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.06) !important;
    border: 1px solid #ccfbf1 !important;
  }
  
  .driverjs-theme-custom .driver-popover-title {
    font-size: 17px !important;
    font-weight: 600 !important;
    color: #1f2937 !important;
    margin-bottom: 6px !important;
  }
  
  .driverjs-theme-custom .driver-popover-description {
    font-size: 13.5px !important;
    color: #4b5563 !important;
    line-height: 1.55 !important;
  }
  
  .driverjs-theme-custom .driver-popover-footer {
    margin-top: 14px !important;
    padding-top: 10px !important;
    border-top: 1px solid #e5e7eb !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    flex-direction: row-reverse !important;
  }
  
  /* Tombol navigasi container */
  .driverjs-theme-custom .driver-popover-navigation-btns {
    display: flex !important;
    gap: 8px !important;
    align-items: center !important;
  }
  
  /* Style umum untuk semua tombol */
  .driverjs-theme-custom button,
  .driverjs-theme-custom .driver-next-btn,
  .driverjs-theme-custom .driver-prev-btn,
  .driverjs-theme-custom .driver-close-btn,
  .driverjs-theme-custom .driver-done-btn {
    cursor: pointer !important;
    pointer-events: auto !important;
    border-radius: 10px !important;
    padding: 7px 14px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  /* Tombol Next */
  .driverjs-theme-custom .driver-next-btn {
    background-color: #14b8a6 !important;
    color: white !important;
    border: none !important;
  }
  
  .driverjs-theme-custom .driver-next-btn:hover {
    background-color: #0d9488 !important;
    transform: scale(1.02) !important;
  }
  
  /* Tombol Previous */
  .driverjs-theme-custom .driver-prev-btn {
    background-color: #f3f4f6 !important;
    color: #4b5563 !important;
    border: 1px solid #e5e7eb !important;
  }
  
  .driverjs-theme-custom .driver-prev-btn:hover { 
    background-color: #e5e7eb !important; 
  }
  
  /* Tombol Close (X) - outline style agar terlihat */
  .driverjs-theme-custom .driver-close-btn {
    color: #069494 !important;
    background: transparent !important;
    border: 1.5px solid #069494 !important;
    border-radius: 8px !important;
    padding: 5px 10px !important;
    font-size: 16px !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    min-width: 32px !important;
  }
  
  .driverjs-theme-custom .driver-close-btn:hover {
    background: #069494 !important;
    color: #ffffff !important;
    border-color: #069494 !important;
  }
  
  /* Tombol Done/Selesai */
  .driverjs-theme-custom .driver-done-btn {
    background-color: #14b8a6 !important;
    color: white !important;
    border: none !important;
    font-weight: 600 !important;
  }
  
  .driverjs-theme-custom .driver-done-btn:hover {
    background-color: #0d9488 !important;
    transform: scale(1.02) !important;
  }
  
  /* Sembunyikan progress text */
  .driverjs-theme-custom .driver-popover-progress-text { 
    display: none !important; 
  }
  
  .driver-popover * { 
    pointer-events: auto !important; 
  }
`;

// ─── UserGuide (auto-start on page load) ─────────────────────────────────────
function UserGuideComponent({
  currentPath,
  onComplete,
}: {
  currentPath: string;
  onComplete?: () => void;
}) {
  const [, setIsGuideActive] = useState(false);
  const hasShownRef = useRef(false);

  const startGuide = () => {
    // Get full path with query params for admin panel
    let fullPath = currentPath;
    if (typeof window !== 'undefined' && currentPath === '/admin') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'resource') {
        fullPath = '/admin?tab=resource';
      } else if (tab === 'users') {
        fullPath = '/admin?tab=users';
      }
    }
    
    const steps = getStepsByPath(fullPath);
    if (steps.length === 0) return;

    setIsGuideActive(true);

    const driverObj = buildDriver(
      () => {
        setIsGuideActive(false);
        if (onComplete) onComplete();
      },
      () => driverObj.destroy(),
    );

    const stepsWithWelcome = steps.map((step, i) =>
      i === 0
        ? {
            ...step,
            popover: {
              ...step.popover,
              popoverClass: 'driverjs-theme-custom welcome-popover',
            },
          }
        : step,
    );

    driverObj.setSteps(stepsWithWelcome);
    driverObj.drive();
  };

  useEffect(() => {
    if (currentPath === '/maintenance') return;
    if (hasShownRef.current) return;
    hasShownRef.current = true;
    const t = setTimeout(startGuide, 1500);
    return () => clearTimeout(t);
  }, [currentPath]);

  useEffect(() => {
    hasShownRef.current = false;
  }, [currentPath]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GUIDE_STYLES;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}

// ─── Floating button ──────────────────────────────────────────────────────────
function GuideFloatingButtonComponent({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate?: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGuideActive, setIsGuideActive] = useState(false);

  const startGuide = () => {
    // Get full path with query params for admin panel
    let fullPath = currentPath;
    if (typeof window !== 'undefined' && currentPath === '/admin') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'resource') {
        fullPath = '/admin?tab=resource';
      } else if (tab === 'users') {
        fullPath = '/admin?tab=users';
      }
    }
    
    const steps = getStepsByPath(fullPath);
    if (steps.length === 0) {
      alert('Belum ada panduan untuk halaman ini');
      return;
    }
    setIsGuideActive(true);

    const driverObj = buildDriver(
      () => { setIsGuideActive(false); setIsOpen(false); },
      () => { driverObj.destroy(); setIsGuideActive(false); setIsOpen(false); },
    );

    const stepsWithWelcome = steps.map((step, i) =>
      i === 0
        ? {
            ...step,
            popover: {
              ...step.popover,
              popoverClass: 'driverjs-theme-custom welcome-popover',
            },
          }
        : step,
    );

    driverObj.setSteps(stepsWithWelcome);
    driverObj.drive();
    setIsOpen(false);
  };

  // Sidebar page routes with guides available
  const availablePages = Object.entries(PAGE_ROUTES).filter(
    ([path]) => getStepsByPath(path).length > 0 && path !== currentPath,
  );

  return (
    <div className="fixed bottom-6 right-6 z-10003">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-linear-to-r from-teal-400 to-teal-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
        aria-label="Bantuan Panduan"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 w-80 overflow-hidden z-10003"
          style={{ animation: 'fadeSlideUp 0.2s ease-out' }}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-teal-400 to-teal-500 px-5 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-white font-semibold text-base">🪄 Panduan Pengguna</h3>
              <p className="text-teal-50 text-xs mt-0.5">Pelajari semua fitur Ventara</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              aria-label="Tutup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current page guide buttons */}
          <div className="p-2">
            <button
              onClick={startGuide}
              disabled={isGuideActive}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 rounded-xl transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium">{isGuideActive ? 'Panduan Sedang Berjalan...' : 'Mulai Panduan Halaman Ini'}</div>
                <div className="text-xs text-gray-400 mt-0.5">Ikuti langkah demi langkah</div>
              </div>
            </button>

            <button
              onClick={startGuide}
              disabled={isGuideActive}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 rounded-xl transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div className="font-medium">Mulai Ulang Panduan</div>
                <div className="text-xs text-gray-400 mt-0.5">Mulai panduan dari awal</div>
              </div>
            </button>
          </div>

          {/* Sidebar navigation — direct to other pages */}
          {availablePages.length > 0 && onNavigate && (
            <>
              <div className="border-t border-gray-100 px-5 py-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Panduan Halaman Lain</p>
              </div>
              <div className="px-2 pb-2 max-h-48 overflow-y-auto">
                {availablePages.map(([path, { label, icon }]) => (
                  <button
                    key={path}
                    onClick={() => {
                      onNavigate(path);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3"
                  >
                    <span className="text-base leading-none">{icon}</span>
                    <span className="font-medium">{label}</span>
                    <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
            <p className="text-xs text-gray-400 text-center">
              💡 Panduan muncul otomatis setiap membuka halaman ini
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function GuideProgressComponent({ currentPath }: { currentPath: string }) {
  return null;
}

const UserGuide = UserGuideComponent;
export const GuideFloatingButton = GuideFloatingButtonComponent;
export const GuideProgress = GuideProgressComponent;
export default UserGuide;
export { getStepsByPath };