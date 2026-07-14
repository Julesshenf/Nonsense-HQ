import React, { useEffect, useMemo, useState } from "react";
import { Identity, FavoriteItem, HistoryItem } from "../types";
import { SLACK_TITLES, SLACKING_QUOTES } from "../data";

const getLocalDateKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

const selectDailyMottos = (dateKey: string) => {
  let seed = Array.from(dateKey).reduce((value, character) => {
    return ((value << 5) - value + character.charCodeAt(0)) >>> 0;
  }, 0);
  const mottos = [...SLACKING_QUOTES];

  for (let index = mottos.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const targetIndex = seed % (index + 1);
    [mottos[index], mottos[targetIndex]] = [mottos[targetIndex], mottos[index]];
  }

  return mottos.slice(0, 3);
};

interface TabMyProps {
  identity: Identity;
  onIdentityChange: (identity: Identity) => void;
  userHours: number;
  userName: string;
  userTitle: string;
  userMotto: string;
  onUpdateProfile: (name: string, title: string, motto: string, password?: string) => void;
  isMadness: boolean;
  onOpenFavorites: () => void;
  onOpenHistory: () => void;
  onOpenBegging: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void | Promise<void>;
}

export const TabMy: React.FC<TabMyProps> = ({
  identity,
  onIdentityChange,
  userHours,
  userName,
  userMotto,
  userTitle,
  onUpdateProfile,
  isMadness,
  onOpenFavorites,
  onOpenHistory,
  onOpenBegging,
  onLogout,
  onDeleteAccount,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editMotto, setEditMotto] = useState(userMotto);
  const [editTitle, setEditTitle] = useState(userTitle);
  const [editPassword, setEditPassword] = useState("");
  const [activeMottoIndex, setActiveMottoIndex] = useState(0);
  const [mottoDateKey, setMottoDateKey] = useState(getLocalDateKey);

  // Compute slack level based on hours
  // Let's say level = floor(sqrt(hours)) + 1, or level = Math.floor(hours / 5) + 1
  const slackLevel = Math.max(1, Math.floor(userHours / 6) + 1);
  const displayedMottos = useMemo(() => selectDailyMottos(mottoDateKey), [mottoDateKey]);

  useEffect(() => {
    const checkForNewDay = () => setMottoDateKey(getLocalDateKey());
    const timer = window.setInterval(checkForNewDay, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => setActiveMottoIndex(0), [mottoDateKey]);

  // Find next title progression
  const getProgressionText = () => {
    const currentTitleIdx = SLACK_TITLES.findIndex((t) => t.name === userTitle);
    const nextTitle = SLACK_TITLES[currentTitleIdx + 1] || SLACK_TITLES[SLACK_TITLES.length - 1];
    
    if (currentTitleIdx === SLACK_TITLES.length - 1) {
      return "已达成终极薪水大盗成就！";
    }

    const hoursNeeded = nextTitle.minHours - userHours;
    if (hoursNeeded <= 0) {
      return `已解锁新头衔: “${nextTitle.name}”`;
    }
    return `距离“${nextTitle.name}”进阶还需 ${hoursNeeded.toFixed(1)}h`;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editName.trim(), editTitle, editMotto.trim(), editPassword.trim() || undefined);
    setEditPassword("");
    setIsEditing(false);
  };

  const getAvatarInitials = () => {
    if (!userName) return "无";
    return userName.trim().substring(0, 1).toUpperCase();
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12 animate-fade-in">
      {/* Settings Panel Toggle is done directly or via a beautiful edit overlay */}
      
      {isEditing ? (
        /* Profile Edit Form */
        <form onSubmit={handleSaveProfile} className="glass-card rounded-3xl p-5 border border-gray-100 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-800">编辑打工人档案</h4>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)} 
              className="text-xs text-gray-400 font-bold hover:text-gray-600"
            >
              取消
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">昵称</label>
              <input 
                type="text" 
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">头衔定位</label>
              <select 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2.5 border border-gray-200 bg-white rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100"
              >
                {SLACK_TITLES.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">生存格言 / 生存理念</label>
              <input 
                type="text" 
                required
                value={editMotto}
                onChange={(e) => setEditMotto(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">修改密码</label>
              <input 
                type="password" 
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="留空则不修改"
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-xs ${
              isMadness ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            保存并应用档案
          </button>
        </form>
      ) : (
        /* Profile Main View */
        <div className="space-y-6">
          {/* Profile and slacking overview */}
          <section className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-stretch gap-3 md:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)] md:gap-5">
            <div className="glass-card flex min-w-0 flex-col items-center justify-center rounded-3xl border border-gray-100 p-3 text-center shadow-sm sm:p-5">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gray-200 text-xl font-black text-gray-500 shadow-md sm:h-20 sm:w-20 sm:text-2xl">
                  {getAvatarInitials()}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditName(userName);
                    setEditMotto(userMotto);
                    setEditTitle(userTitle);
                    setEditPassword("");
                    setIsEditing(true);
                  }}
                  className={`absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-white shadow-md transition-transform active:scale-90 ${
                    isMadness ? "bg-red-600" : "bg-blue-600"
                  }`}
                  title="修改资料"
                  aria-label="修改资料"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>

              <h3 className="mt-2 w-full truncate text-sm font-bold text-gray-800 sm:text-base">{userName}</h3>
              <span className="mt-1 max-w-full truncate rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 sm:text-[10px]">
                {userTitle}
              </span>

              <div className="mt-3 grid w-full grid-cols-2 gap-1 rounded-xl border border-gray-100 bg-white/80 p-1" aria-label="身份选择">
                <button
                  type="button"
                  aria-pressed={identity === "Worker"}
                  onClick={() => onIdentityChange("Worker")}
                  className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-bold transition-all active:scale-95 sm:text-xs ${
                    identity === "Worker"
                      ? isMadness
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">work</span>
                  牛马
                </button>
                <button
                  type="button"
                  aria-pressed={identity === "Student"}
                  onClick={() => onIdentityChange("Student")}
                  className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-bold transition-all active:scale-95 sm:text-xs ${
                    identity === "Student"
                      ? isMadness
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">school</span>
                  学生
                </button>
              </div>
            </div>

            <div className="glass-card flex min-w-0 flex-col rounded-3xl border border-gray-100 p-4 shadow-sm sm:p-5">
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="min-w-0 pr-3">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">摸鱼等级</span>
                  <span className={`mt-1 block text-xl font-black sm:text-3xl ${isMadness ? "text-red-600" : "text-blue-600"}`}>
                    Lv.{slackLevel}
                  </span>
                </div>
                <div className="min-w-0 pl-3">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">摸鱼时间</span>
                  <span className="mt-1 block truncate text-xl font-black text-orange-600 sm:text-3xl">
                    {userHours}<span className="ml-1 text-[9px] font-semibold text-gray-400 sm:text-xs">小时</span>
                  </span>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-100 pt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-gray-500 sm:text-xs">摸鱼进度</span>
                  <span className="truncate text-right text-[8px] font-semibold text-gray-400 sm:text-[10px]">{getProgressionText()}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 sm:h-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isMadness ? "bg-red-600" : "bg-blue-600"}`}
                    style={{ width: `${Math.min(100, (userHours % 6) * 16.6)}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Menu Options List */}
          <section className="glass-card rounded-2xl overflow-hidden border border-gray-100 divide-y divide-gray-100 shadow-xs">
            <button
              onClick={onOpenFavorites}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 text-sm text-gray-700 font-semibold">
                <span className="material-symbols-outlined text-blue-500 group-hover:scale-110 transition-transform">
                  grade
                </span>
                我的收藏
              </div>
              <span className="material-symbols-outlined text-gray-300 text-lg group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>

            <button
              onClick={onOpenHistory}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 text-sm text-gray-700 font-semibold">
                <span className="material-symbols-outlined text-emerald-500 group-hover:scale-110 transition-transform">
                  history
                </span>
                历史记录
              </div>
              <span className="material-symbols-outlined text-gray-300 text-lg group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>

            <button
              onClick={onOpenBegging}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 text-sm text-gray-700 font-semibold">
                <span className="material-symbols-outlined text-yellow-500 group-hover:scale-110 transition-transform">
                  volunteer_activism
                </span>
                作者乞讨
              </div>
              <span className="material-symbols-outlined text-gray-300 text-lg group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>

            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 text-sm text-gray-700 font-semibold">
                <span className="material-symbols-outlined text-slate-500 group-hover:scale-110 transition-transform">
                  manage_accounts
                </span>
                关于账号
              </div>
              <span className="material-symbols-outlined text-gray-300 text-lg group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>
          </section>

          {isAccountModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-fade-in">
                <div className={`p-5 text-white flex items-center justify-between ${isMadness ? "bg-red-600" : "bg-blue-600"}`}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl">manage_accounts</span>
                    <h3 className="text-lg font-bold">关于账号</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAccountModalOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountModalOpen(false);
                      onLogout();
                    }}
                    className="w-full p-4 rounded-2xl border border-gray-200 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold text-gray-800">
                      <span className="material-symbols-outlined text-blue-500">logout</span>
                      退出登录
                    </span>
                    <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("确定要注销账号吗？账号会从 data/accounts.json 中删除，本地进度也会清空。此操作无法撤销。")) {
                        setIsAccountModalOpen(false);
                        onDeleteAccount();
                      }
                    }}
                    className="w-full p-4 rounded-2xl border border-red-100 bg-red-50/60 flex items-center justify-between text-left hover:bg-red-50 transition-all"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold text-red-600">
                      <span className="material-symbols-outlined text-red-500">delete_forever</span>
                      注销账号
                    </span>
                    <span className="material-symbols-outlined text-red-300">delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Swipeable mottos at the bottom */}
          <section className="space-y-2" aria-label="格言">
            <div
              key={mottoDateKey}
              onScroll={(event) => {
                const container = event.currentTarget;
                const slideWidth = container.clientWidth + 12;
                setActiveMottoIndex(Math.round(container.scrollLeft / slideWidth));
              }}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {displayedMottos.map((quote, index) => (
                <div
                  key={`${quote}-${index}`}
                  className="glass-card flex min-h-24 w-full shrink-0 snap-center items-center justify-center rounded-2xl border border-gray-100 p-4 text-center shadow-sm"
                >
                  <p className="font-display text-xs font-semibold italic leading-relaxed text-gray-700 sm:text-sm">
                    {quote}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1.5" aria-hidden="true">
              {displayedMottos.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeMottoIndex
                      ? isMadness
                        ? "w-4 bg-red-600"
                        : "w-4 bg-blue-600"
                      : "w-1.5 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
