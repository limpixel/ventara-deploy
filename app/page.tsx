'use client';

import LoginForm from "@/app/components/login/LoginForm";
import RegisterForm from "@/app/components/login/RegisterForm";
import LandingPanel from "@/app/components/login/LandingPanel";
import OverlayPanel from "@/app/components/login/OverlayPanel";
import { useAuth } from "@/app/hooks/useAuth";

export default function LoginPage() {
  const {
    view,
    setView,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    isError,
    deactivatedUsername,
    setDeactivatedUsername,
  } = useAuth();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dff7f3,#ccebe6,#eafaf7)]">
      {/* AMBIENT LIGHT */}
      <div className="absolute w-125 h-125 bg-[#00a991]/20 blur-[120px] rounded-full -top-30 -left-25" />
      <div className="absolute w-100 h-100 bg-[#008774]/10 blur-[120px] rounded-full -bottom-30 -right-25" />

      {/* MAIN CONTAINER */}
      <div className="relative w-full h-full overflow-hidden bg-teal-300">

        {/* OVERLAY PANEL */}
        <div className={`absolute top-0 w-1/2 h-full z-20 transition-all duration-700 ease-in-out ${view === 'login' ? 'left-1/2' : 'left-0'}`}>
          <div className="relative w-full h-full shadow-[0_20px_45px_rgba(0,169,145,0.35)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)] before:pointer-events-none">
            <OverlayPanel isError={isError} isLogin={view === 'login'} />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className={`absolute top-0 w-1/2 h-full right-0 flex items-start justify-center pt-24 transition-all duration-700 ${view === 'login' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* LANDING */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${view === 'landing' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
            <LandingPanel onStart={() => setView('login')} />
          </div>

          {/* REGISTER */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${view === 'register' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
            <RegisterForm onRegister={handleRegister} onSwitch={() => setView('login')} />
          </div>
        </div>

        {/* LOGIN */}
        <div className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center transition-all duration-700 ${view === 'login' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <LoginForm onLogin={handleLogin} onSwitch={() => setView('register')} onForgotPassword={handleForgotPassword} />
        </div>
      </div>

      {deactivatedUsername && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Akun Dinonaktifkan</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Akun anda telah di non aktifkan, harap hubungi admin.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/+628115133959?text=Halo%20admin%2C%20saya%20${encodeURIComponent(deactivatedUsername)}%20ingin%20mengaktifkan%20kembali%20akun%20saya.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 rounded-xl bg-green-500 text-white font-medium text-center hover:bg-green-600 transition-all"
              >
                Hubungi Admin via WhatsApp
              </a>
              <button
                onClick={() => setDeactivatedUsername(null)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}