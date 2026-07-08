import React, { useEffect, useMemo, useState } from "react";
import { PlayerAccount } from "../types";

interface LoginModalProps {
  isOpen: boolean;
  isMadness: boolean;
  onAuthenticated: (account: PlayerAccount) => void;
}

type AccountCheck = "idle" | "checking" | "available" | "matched" | "password_mismatch" | "error";

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  isMadness,
  onAuthenticated,
}) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [motto, setMotto] = useState("");
  const [checkState, setCheckState] = useState<AccountCheck>("idle");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = useMemo(() => name.trim(), [name]);
  const trimmedPassword = useMemo(() => password.trim(), [password]);
  const trimmedMotto = useMemo(() => motto.trim(), [motto]);
  const canSubmit = trimmedName.length > 0 && trimmedPassword.length > 0;

  useEffect(() => {
    if (!isOpen) return;

    setMessage("");
    if (!trimmedName || !trimmedPassword) {
      setCheckState("idle");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCheckState("checking");
      try {
        const response = await fetch(`/api/accounts/check?name=${encodeURIComponent(trimmedName)}&password=${encodeURIComponent(trimmedPassword)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "检查账号失败");
        if (!data.exists) {
          setCheckState("available");
        } else if (data.passwordMatches) {
          setCheckState("matched");
        } else {
          setCheckState("password_mismatch");
          setMessage("这个名称已经注册过了，但密码不匹配。");
        }
      } catch (error: any) {
        if (error.name === "AbortError") return;
        setCheckState("error");
        setMessage("账号检查失败，请稍后再试。");
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, trimmedName, trimmedPassword]);

  if (!isOpen) return null;

  const handleRegister = async () => {
    if (!canSubmit) {
      setMessage("请先填写名称和密码。");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/accounts/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, password, motto: trimmedMotto }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "注册失败");
      if (!data.account) throw new Error("注册成功但没有收到账号资料");
      onAuthenticated(data.account);
    } catch (error: any) {
      setMessage(error.message || "注册失败，请稍后再试。");
      setCheckState("password_mismatch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!canSubmit) {
      setMessage("请先填写名称和密码。");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, password, motto: trimmedMotto }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "登录失败");
      if (!data.account) throw new Error("登录成功但没有收到账号资料");
      onAuthenticated(data.account);
    } catch (error: any) {
      setMessage(error.message || "登录失败，请检查密码。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-fade-in">
        <div className={`p-6 text-white ${isMadness ? "bg-red-600" : "bg-blue-600"}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">login</span>
            <h2 className="text-xl font-black">登录</h2>
          </div>
        </div>

        <form className="p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">名称</label>
            <input
              autoFocus
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">人生格言</label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="可填可不填"
              className="w-full p-3 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          {checkState === "matched" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="text-sm font-bold text-amber-900">这被注册过，这是你的账号吗？</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleLogin}
                  className={`py-3 rounded-xl text-white text-sm font-bold active:scale-95 transition-all disabled:opacity-60 ${
                    isMadness ? "bg-red-600" : "bg-blue-600"
                  }`}
                >
                  是
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setName("");
                    setPassword("");
                    setMotto("");
                    setCheckState("idle");
                    setMessage("");
                  }}
                  className="py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold active:scale-95 transition-all disabled:opacity-60"
                >
                  不是
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={!canSubmit || isSubmitting || checkState === "checking" || checkState === "password_mismatch"}
              onClick={handleRegister}
              className={`w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 ${
                isMadness ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {checkState === "available" ? "person_add" : "hourglass_empty"}
              </span>
              {checkState === "checking" ? "检查中" : checkState === "password_mismatch" ? "密码不匹配" : "注册"}
            </button>
          )}

          {message && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
