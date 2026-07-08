import React from "react";

interface HeaderProps {
  title: string;
  isMadness: boolean;
  onHistoryClick: () => void;
  onFavoritesClick: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  isMadness,
  onHistoryClick,
  onFavoritesClick,
  showBackButton = false,
  onBackClick,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex justify-between items-center px-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <button
            onClick={onBackClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
            id="back-btn"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        ) : (
          <button
            onClick={onHistoryClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
              isMadness ? "text-red-600 hover:bg-red-50" : "text-blue-600 hover:bg-blue-50"
            }`}
            id="header-history-btn"
            title="历史记录"
          >
            <span className="material-symbols-outlined text-[28px]">history</span>
          </button>
        )}
      </div>

      <h1
        className={`font-sans text-xl font-bold transition-colors duration-300 ${
          isMadness ? "text-red-600 font-extrabold tracking-wider animate-pulse" : "text-blue-600"
        }`}
        id="header-title"
      >
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <button
          onClick={onFavoritesClick}
          className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
            isMadness ? "text-red-600 hover:bg-red-50" : "text-blue-600 hover:bg-blue-50"
          }`}
          id="header-favorites-btn"
          title="我的收藏"
        >
          <span className="material-symbols-outlined text-[28px]">grade</span>
        </button>
      </div>
    </header>
  );
};
