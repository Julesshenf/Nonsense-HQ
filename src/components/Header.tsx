import React from "react";

interface HeaderProps {
  isMadness: boolean;
  activeTab: "tools" | "rankings" | "my";
  onMyClick: () => void;
  onRankingsClick: () => void;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMadness,
  activeTab,
  onMyClick,
  onRankingsClick,
  onThemeToggle,
}) => {
  const activeClasses = isMadness ? "bg-red-600 text-white shadow-sm" : "bg-blue-600 text-white shadow-sm";
  const idleClasses = isMadness ? "text-red-600 hover:bg-red-50" : "text-blue-600 hover:bg-blue-50";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex justify-between items-center px-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={onMyClick}
          className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
            activeTab === "my" ? activeClasses : idleClasses
          }`}
          id="header-my-btn"
          title="我的"
          aria-label="我的"
        >
          <span className={`material-symbols-outlined text-[28px] ${activeTab === "my" ? "material-fill" : ""}`}>person</span>
        </button>
        <button
          type="button"
          onClick={onThemeToggle}
          className="h-10 w-10 rounded-full opacity-0 outline-none focus-visible:opacity-30 focus-visible:ring-2 focus-visible:ring-blue-500"
          id="header-theme-toggle"
          aria-label="切换黑白主题"
        />
      </div>

      <div aria-hidden="true" />

      <div className="flex items-center justify-end w-16 h-12 group">
        <button
          onClick={onRankingsClick}
          className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus:opacity-100 focus:pointer-events-auto ${
            activeTab === "rankings" ? activeClasses : idleClasses
          }`}
          id="header-rankings-btn"
          title="排名"
          aria-label="排名"
        >
          <span className={`material-symbols-outlined text-[28px] ${activeTab === "rankings" ? "material-fill" : ""}`}>leaderboard</span>
        </button>
      </div>
    </header>
  );
};
