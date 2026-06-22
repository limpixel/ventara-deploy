"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export type AuthView = "landing" | "register" | "login";
export type LoginStatus = "idle" | "loading" | "blocked" | "error";

// ============================================================
// HELPERS: Tab ID & Heartbeat
// ============================================================
function getTabId(): string {
  let id = sessionStorage.getItem("tab_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tab_id", id);
  }
  return id;
}

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

function startHeartbeat(userId: string, tabId: string) {
  stopHeartbeat();

  heartbeatTimer = setInterval(
    async () => {
      await supabase
        .from("active_sessions")
        .update({ last_seen: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("tab_id", tabId);
    },
    5 * 60 * 1000,
  ); // tiap 5 menit

  // Hapus session saat tab ditutup
  window.addEventListener("beforeunload", () => {
    supabase
      .from("active_sessions")
      .delete()
      .eq("user_id", userId)
      .eq("tab_id", tabId);
    stopHeartbeat();
  });
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// ============================================================
// HOOK: useAuth
// ============================================================
export function useAuth() {
  const router = useRouter();
  const [view, setView] = useState<AuthView>("landing");
  const [isError, setIsError] = useState(false);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("idle");
  const [blockedMessage, setBlockedMessage] = useState("");

  // --------------------------------------------------------
  // handleLogin — dengan session filter
  // --------------------------------------------------------
  const handleLogin = async (username: string, password: string) => {
    setLoginStatus("loading");
    setBlockedMessage("");

    try {
      // STEP 1: Login ke Flask (auth existing kamu)
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setIsError(true);
        setLoginStatus("error");
        setTimeout(() => {
          setIsError(false);
          setLoginStatus("idle");
        }, 4000);
        return;
      }

      // STEP 2: Cek active session di Supabase
      // Flask harus return user_id (UUID dari tabel users Supabase)
      const userId = data.user_id;
      const tabId = getTabId();

      if (userId) {
        const thirtyMinutesAgo = new Date(
          Date.now() - 30 * 60 * 1000,
        ).toISOString();

        const { data: existingSessions } = await supabase
          .from("active_sessions")
          .select("tab_id, last_seen")
          .eq("user_id", userId)
          .neq("tab_id", tabId)
          .gt("last_seen", thirtyMinutesAgo);

        if (existingSessions && existingSessions.length > 0) {
          // Ada session aktif di tempat lain → blokir
          setLoginStatus("blocked");
          setBlockedMessage(
            "Akun ini sedang aktif di perangkat atau tab lain. Silakan logout dari sana terlebih dahulu.",
          );
          // Batalkan session Flask yang baru dibuat
          await fetch("http://localhost:5000/logout", {
            method: "POST",
            credentials: "include",
          });
          return;
        }

        // STEP 3: Daftarkan session tab ini
        await supabase.from("active_sessions").upsert(
          {
            user_id: userId,
            tab_id: tabId,
            last_seen: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          { onConflict: "user_id,tab_id" },
        );

        // STEP 4: Mulai heartbeat
        startHeartbeat(userId, tabId);

        // Simpan user_id di sessionStorage untuk keperluan logout nanti
        sessionStorage.setItem("ventara_user_id", userId);
      }

      // STEP 5: Simpan data user seperti semula
      sessionStorage.setItem("ventara_role", data.role);
      sessionStorage.setItem("ventara_name", data.name);
      sessionStorage.setItem("ventara_username", data.username);
      sessionStorage.setItem("ventara_email", data.email || "");
      sessionStorage.setItem("ventara_avatar", data.avatar || "");
      document.cookie = `ventara_username=${data.username}; path=/; SameSite=Lax`;

      setLoginStatus("idle");
      router.push(data.role === "admin" ? "/admin/dashboard" : "/forecasting");
    } catch {
      setIsError(true);
      setLoginStatus("error");
      setTimeout(() => {
        setIsError(false);
        setLoginStatus("idle");
      }, 4000);
    }
  };

  // --------------------------------------------------------
  // handleLogout — hapus session dari Supabase
  // --------------------------------------------------------
  const handleLogout = async () => {
    const userId = sessionStorage.getItem("ventara_user_id");
    const tabId = getTabId();

    if (userId) {
      await supabase
        .from("active_sessions")
        .delete()
        .eq("user_id", userId)
        .eq("tab_id", tabId);
      stopHeartbeat();
    }

    // Bersihkan sessionStorage
    sessionStorage.clear();

    // Logout dari Flask
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/");
  };

  // --------------------------------------------------------
  // handleRegister — tidak berubah
  // --------------------------------------------------------
  const handleRegister = async (
    username: string,
    email: string,
    password: string,
  ) => {
    if (!username || !email || !password) {
      alert("⚠️ All fields are required.");
      return;
    }
    if (!email.includes("@")) {
      alert("📧 Invalid email.");
      return;
    }
    if (password.length < 4) {
      alert("🔒 Password minimum 4 characters.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, name: username }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(`❌ ${data.message}`);
        return;
      }

      alert(`🎉 ${data.message} Please login.`);
      setView("login");
    } catch {
      alert("❌ Server error. Please try again.");
    }
  };

  // --------------------------------------------------------
  // handleForgotPassword — tidak berubah
  // --------------------------------------------------------
  const handleForgotPassword = () => {
    alert("📩 Reset password feature coming soon.");
  };

  return {
    view,
    setView,
    handleLogin,
    handleLogout,
    handleRegister,
    handleForgotPassword,
    isError,
    loginStatus,
    blockedMessage,
  };
}
