import React, { useState } from "react";
import { Identity, FavoriteItem, HistoryItem } from "../types";
import { SLACK_TITLES, SLACKING_QUOTES } from "../data";

interface TabMyProps {
  userHours: number;
  userName: string;
  userTitle: string;
  userMotto: string;
  onUpdateProfile: (name: string, title: string, motto: string) => void;
  isMadness: boolean;
  onOpenFavorites: () => void;
  onOpenHistory: () => void;
  onOpenBegging: () => void;
  onResetData: () => void;
}

export const TabMy: React.FC<TabMyProps> = ({
  userHours,
  userName,
  userMotto,
  userTitle,
  onUpdateProfile,
  isMadness,
  onOpenFavorites,
  onOpenHistory,
  onOpenBegging,
  onResetData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editMotto, setEditMotto] = useState(userMotto);
  const [editTitle, setEditTitle] = useState(userTitle);

  const [quoteIndex, setQuoteIndex] = useState(0);

  // Compute slack level based on hours
  // Let's say level = floor(sqrt(hours)) + 1, or level = Math.floor(hours / 5) + 1
  const slackLevel = Math.max(1, Math.floor(userHours / 6) + 1);

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

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % SLACKING_QUOTES.length);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editName.trim(), editTitle, editMotto.trim());
    setIsEditing(false);
  };

  const getAvatarInitials = () => {
    if (!userName) return "无";
    return userName.trim().substring(0, 1).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
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
          <div className="flex flex-col items-center text-center space-y-3 pt-3">
            {/* Avatar block */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-2xl font-black text-gray-500">
                {getAvatarInitials()}
              </div>
              <button 
                onClick={() => {
                  setEditName(userName);
                  setEditMotto(userMotto);
                  setEditTitle(userTitle);
                  setIsEditing(true);
                }}
                className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md cursor-pointer transition-transform active:scale-90 ${
                  isMadness ? "bg-red-600" : "bg-blue-600"
                }`}
                title="修改资料"
              >
                <span className="material-symbols-outlined text-base">edit</span>
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center justify-center gap-1">
                {userName}
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full font-bold">
                  {userTitle}
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-1 italic">
                {userMotto}
              </p>
            </div>
          </div>

          {/* Double Stats Grid Matching Mockup Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Level Stat box */}
            <div className="glass-card p-5 rounded-2xl border border-gray-100 flex flex-col justify-between h-36">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">摸鱼等级</span>
                <span className={`text-2xl font-black block mt-1 ${isMadness ? "text-red-600" : "text-blue-600"}`}>
                  Lv.{slackLevel}
                </span>
              </div>
              
              <div className="space-y-1.5">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isMadness ? "bg-red-600" : "bg-blue-600"}`} 
                    style={{ width: `${Math.min(100, (userHours % 6) * 16.6)}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-gray-400 block truncate font-semibold leading-none">
                  {getProgressionText()}
                </span>
              </div>
            </div>

            {/* Hours Stat box */}
            <div className="glass-card p-5 rounded-2xl border border-gray-100 flex flex-col justify-between h-36 relative overflow-hidden">
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">总摸鱼时间</span>
                <span className="text-2xl font-black text-orange-600 block mt-1">
                  {userHours} <span className="text-xs font-semibold text-gray-400">小时</span>
                </span>
              </div>

              <div className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-xs">
                <span className="material-symbols-outlined text-lg">schedule</span>
              </div>
            </div>
          </div>

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
              onClick={() => {
                if (confirm("确定要清空所有摸鱼进度、重置打工人档案吗？此操作无法撤销。")) {
                  onResetData();
                }
              }}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-red-50/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 text-sm text-red-600 font-semibold">
                <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">
                  delete_forever
                </span>
                重置账户数据
              </div>
              <span className="material-symbols-outlined text-gray-300 text-lg">
                delete
              </span>
            </button>
          </section>

          {/* Slacking Quote Carousel at the bottom */}
          <div 
            onClick={handleNextQuote}
            className="glass-card p-5 rounded-2xl text-center border border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-all flex flex-col items-center justify-center space-y-2 group"
            title="点击切换金句"
          >
            <p className="font-display text-sm font-semibold text-gray-800 leading-relaxed italic select-none group-hover:scale-[1.01] transition-transform">
              {SLACKING_QUOTES[quoteIndex]}
            </p>
            
            {/* Pagination indicator dots */}
            <div className="flex gap-1 pt-1.5 justify-center">
              {SLACKING_QUOTES.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === quoteIndex 
                      ? isMadness ? "bg-red-600 w-3" : "bg-blue-600 w-3" 
                      : "bg-gray-200"
                  }`}
                ></span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
