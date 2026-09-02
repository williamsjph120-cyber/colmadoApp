"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const MAX_ATTEMPTS = 4;
const WARN_ATTEMPT = 5;
const LOCK_ATTEMPT = 6;
const LOCK_DURATION = 3 * 60 * 1000; // 3 minutes

function getAttempts(): { count: number; lockedAt: number | null } {
  if (typeof window === "undefined") return { count: 0, lockedAt: null };
  try {
    const data = JSON.parse(localStorage.getItem("login_attempts") || "0");
    if (typeof data === "object" && data !== null) return data;
    return { count: Number(data) || 0, lockedAt: null };
  } catch {
    return { count: 0, lockedAt: null };
  }
}

function saveAttempts(count: number, lockedAt: number | null) {
  localStorage.setItem("login_attempts", JSON.stringify({ count, lockedAt }));
}

function resetAttempts() {
  localStorage.removeItem("login_attempts");
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  const checkLock = useCallback(() => {
    const data = getAttempts();
    if (data.lockedAt) {
      const elapsed = Date.now() - data.lockedAt;
      if (elapsed < LOCK_DURATION) {
        setLocked(true);
        setLockRemaining(Math.ceil((LOCK_DURATION - elapsed) / 1000));
        return true;
      } else {
        resetAttempts();
        setLocked(false);
        setAttempts(0);
        setLockRemaining(0);
        return false;
      }
    }
    setLocked(false);
    setAttempts(data.count);
    return false;
  }, []);

  useEffect(() => {
    checkLock();
    const interval = setInterval(() => {
      const data = getAttempts();
      if (data.lockedAt) {
        const elapsed = Date.now() - data.lockedAt;
        if (elapsed < LOCK_DURATION) {
          setLockRemaining(Math.ceil((LOCK_DURATION - elapsed) / 1000));
        } else {
          resetAttempts();
          setLocked(false);
          setAttempts(0);
          setLockRemaining(0);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [checkLock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { getSupabase } = await import("@/lib/supabase");
    const supabase = getSupabase();

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        await supabase.from("subscriptions").insert({
          user_id: data.user.id,
          plan: "basico",
          status: "trial",
          expires_at: expires.toISOString(),
        });
      }
      resetAttempts();
      router.replace("/dashboard");
    } else {
      const data = getAttempts();

      if (data.lockedAt && Date.now() - data.lockedAt < LOCK_DURATION) {
        const remaining = Math.ceil((LOCK_DURATION - (Date.now() - data.lockedAt)) / 1000);
        setError(`Demasiados intentos. Espera ${remaining} segundos.`);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const newCount = data.count + 1;
        let lockedAt = data.lockedAt;

        if (newCount >= LOCK_ATTEMPT) {
          lockedAt = Date.now();
          setLocked(true);
          setLockRemaining(LOCK_DURATION / 1000);
          saveAttempts(newCount, lockedAt);
          setError("Demasiados intentos. Cuenta bloqueada 3 minutos.");
        } else if (newCount >= WARN_ATTEMPT) {
          saveAttempts(newCount, null);
          setAttempts(newCount);
          setError(`Intento ${newCount}/${LOCK_ATTEMPT}. Si fallas más, se bloqueará por 3 minutos.`);
        } else if (newCount >= MAX_ATTEMPTS) {
          saveAttempts(newCount, null);
          setAttempts(newCount);
          setError(`Credenciales incorrectas. Te quedan ${LOCK_ATTEMPT - newCount} intentos.`);
        } else {
          saveAttempts(newCount, null);
          setAttempts(newCount);
          setError("Credenciales incorrectas");
        }
        setLoading(false);
        return;
      }

      resetAttempts();
      router.replace("/dashboard");
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-amber-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">
            Colmado<span className="text-teal-600">App</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {isRegister ? "Crea tu cuenta" : "Inicia sesión para continuar"}
          </p>
        </div>

        {error && (
          <div className={`p-3 rounded-xl text-sm mb-4 ${
            locked ? "bg-red-100 text-red-700 border border-red-200" :
            attempts >= WARN_ATTEMPT ? "bg-amber-50 text-amber-700 border border-amber-200" :
            "bg-red-50 text-red-600"
          }`}>
            {locked && <span className="font-bold">Bloqueado — </span>}
            {error}
            {locked && lockRemaining > 0 && (
              <span className="block mt-1 text-xs">Desbloquea en: {formatTime(lockRemaining)}</span>
            )}
          </div>
        )}

        {!isRegister && attempts > 0 && !locked && (
          <div className="mb-4">
            <div className="flex gap-1">
              {Array.from({ length: LOCK_ATTEMPT }).map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                  i < attempts ? (attempts >= WARN_ATTEMPT ? "bg-amber-400" : "bg-red-400") : "bg-gray-200"
                }`} />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-right">{attempts}/{LOCK_ATTEMPT} intentos</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={locked}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={locked}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={loading || locked}
            className="w-full py-3.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locked ? `Bloqueado ${formatTime(lockRemaining)}` : loading ? "Cargando..." : isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            disabled={locked}
            className="text-sm text-gray-400 hover:text-teal-600 transition disabled:opacity-50"
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
}
