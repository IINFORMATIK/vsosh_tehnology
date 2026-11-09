/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  ChevronsRight, 
  Info,
  CheckCircle,
  AlertTriangle,
  GraduationCap
} from "lucide-react";
import { User } from "../types";

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Пожалуйста, заполните все поля");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || "Ошибка авторизации");
      }
    } catch (err) {
      setErrorMsg("Ошибка подключения к серверу. Убедитесь, что сервер Node.js запущен.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password || !firstName || !lastName) {
      setErrorMsg("Все поля при регистрации обязательны");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg(data.message);
        // Reset inputs
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setIsLoginView(true);
      } else {
        setErrorMsg(data.error || "Ошибка подачи заявки");
      }
    } catch (err) {
      setErrorMsg("Ошибка связи с сервером при отправке данных");
    } finally {
      setLoading(false);
    }
  };

  // Helper to autocomp demo logins
  const applyDemoLogin = (role: "admin" | "student") => {
    if (role === "admin") {
      setEmail("schooltehnopark@gmail.com");
      setPassword("admin123");
    } else {
      setEmail("student@mail.ru");
      setPassword("student123");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-205 rounded-xl p-8 text-slate-800 shadow-xl animate-fade-in my-10 select-none">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full mb-3 border border-blue-100">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
          {isLoginView ? "Вход на портал сборной" : "Регистрация кандидата"}
        </h2>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          {isLoginView 
            ? "Войдите для доступа к закрытой теории и тренировочным тестам" 
            : "Ваша анкета будет направлена на проверку куратору ВсОШ"
          }
        </p>
      </div>

      {successMsg && (
        <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
          <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={isLoginView ? handleLogin : handleRegister} className="space-y-4">
        {!isLoginView && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-500 font-mono uppercase mb-1">Имя</label>
              <input
                type="text"
                placeholder="Михаил"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-mono uppercase mb-1">Фамилия</label>
              <input
                type="text"
                placeholder="Ломоносов"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] text-slate-500 font-mono uppercase mb-1">Почта (Email)</label>
          <div className="relative">
            <input
              type="email"
              placeholder="name@shkola.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 pl-9 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
            <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-slate-500 font-mono uppercase mb-1">Пароль</label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2 pl-9 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
            <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded transition-all shadow hover:shadow-blue-550/25 cursor-pointer flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <span>Загрузка...</span>
          ) : isLoginView ? (
            <>Войти <LogIn className="h-4 w-4" /></>
          ) : (
            <>Подать заявку <UserPlus className="h-4 w-4" /></>
          )}
        </button>
      </form>

      {/* Switch Form Trigger */}
      <div className="mt-5 text-center">
        <button
          onClick={() => {
            setIsLoginView(!isLoginView);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className="text-xs text-blue-600 hover:text-blue-500 font-sans transition cursor-pointer font-semibold animate-transition"
        >
          {isLoginView ? "Нет аккаунта? Подать заявку на регистрацию" : "Уже отправляли заявку? Войти на портал"}
        </button>
      </div>

      {/* Quick Access presentation controls */}
      {isLoginView && (
        <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Info className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-[10px] font-semibold font-mono uppercase tracking-wider">Тестовый демонстрационный доступ</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => applyDemoLogin("student")}
              className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-705 rounded font-sans transition-all cursor-pointer text-left font-sans"
            >
              👩‍🎓 Войти как <strong className="text-blue-600 block font-semibold">Ученик (Дмитрий)</strong>
              <span className="text-[9px] text-slate-450 font-mono italic">student123</span>
            </button>
            <button
              onClick={() => applyDemoLogin("admin")}
              className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-755 rounded font-sans transition-all cursor-pointer text-left font-sans"
            >
              👑 Войти как <strong className="text-amber-600 block font-semibold">Администратор</strong>
              <span className="text-[9px] text-slate-450 font-mono italic">admin123</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
