import React, { useState, useEffect, useRef } from "react";
import { Identity, VentingMessage } from "../types";
import { BOSS_VIBES, VENT_BACKGROUND_COMMENTS } from "../data";
import { LuckyWheel, FingerCalculator, RelationshipCalculator, GenderPredictor } from "./ExtraTools";

interface TabToolsProps {
  identity: Identity;
  isMadness: boolean;
  onOpenEnergyModal: () => void;
  onOpenTribunalModal: () => void;
  onAddSlackingHours: (hoursToAdd: number) => void;
  onAddHistory: (type: "slack_session", title: string, subtitle: string, details: any) => void;
}

export const TabTools: React.FC<TabToolsProps> = ({
  identity,
  isMadness,
  onOpenEnergyModal,
  onOpenTribunalModal,
  onAddSlackingHours,
  onAddHistory,
}) => {
  // Active Auxiliary Tool State
  const [activeSubTool, setActiveSubTool] = useState<"wheel" | "finger" | "relative" | "gender">("wheel");

  // Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState("Bathroom Escape (带薪拉屎)");
  const [slackMessage, setSlackMessage] = useState<string | null>(null);
  
  const timerRef = useRef<any>(null);

  const activities = [
    "Bathroom Escape (带薪拉屎)",
    "Water Break (漫长接水)",
    "Staring blankly (太空发呆)",
    "Fake typing (疯狂敲空键盘)",
    "Screen Cleaning (擦拭显示器保护膜)",
  ];

  // Bullet Venting Wall State
  const [ventText, setVentText] = useState("");
  const [bullets, setBullets] = useState<VentingMessage[]>([]);
  const bulletContainerRef = useRef<HTMLDivElement>(null);

  // Initialize initial mock bullet messages
  useEffect(() => {
    const initialBullets = VENT_BACKGROUND_COMMENTS.map((text, idx) => ({
      id: `init_${idx}`,
      text,
      timestamp: Date.now(),
      x: 10 + Math.random() * 80,
      y: 10 + (idx * 9) % 80, // spaced vertically
      color: getRandomColor(),
      speed: 0.5 + Math.random() * 0.8,
    }));
    setBullets(initialBullets);
  }, []);

  // Bullet drift animation runner
  useEffect(() => {
    const interval = setInterval(() => {
      setBullets((prevBullets) =>
        prevBullets.map((b) => {
          let newX = b.x - b.speed;
          if (newX < -30) {
            // wrap around to the right
            newX = 100;
          }
          return { ...b, x: newX };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getRandomColor = () => {
    const colors = [
      "text-red-400",
      "text-orange-400",
      "text-yellow-400",
      "text-blue-400",
      "text-purple-400",
      "text-pink-400",
      "text-emerald-400",
      "text-indigo-400",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Timer Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setSecondsElapsed(0);
    setSlackMessage(null);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    if (secondsElapsed > 0) {
      // Calculate hours from seconds (mocked to make it fun: 1 second = 0.5 hour of grinding effort equivalent, or let's say 1 second = 0.1 hour of slacking level, so it climbs reasonably!)
      const hoursEarned = Number((secondsElapsed * 0.1).toFixed(1));
      onAddSlackingHours(hoursEarned);

      // Estimate funny virtual money saved
      const wagePerSecond = 0.08; // e.g. 8 cents
      const moneyEarned = (secondsElapsed * wagePerSecond).toFixed(2);

      const msg = `🎉 成功侵占资本家时间 ${secondsElapsed}秒！\n折合带薪额: ￥${moneyEarned}元，获得摸鱼值 +${hoursEarned}h！`;
      setSlackMessage(msg);

      onAddHistory(
        "slack_session",
        `完成摸鱼: ${selectedActivity}`,
        `时长 ${secondsElapsed} 秒，侵占薪资 ￥${moneyEarned}`,
        { secondsElapsed, selectedActivity, moneyEarned }
      );
    }
  };

  const handleVentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ventText.trim()) return;

    const newBullet: VentingMessage = {
      id: `user_${Date.now()}`,
      text: ventText.trim(),
      timestamp: Date.now(),
      x: 100, // starts offscreen right
      y: 10 + Math.random() * 75,
      color: isMadness ? "text-red-500 font-extrabold" : getRandomColor() + " font-bold",
      speed: 1.2 + Math.random() * 1.5,
    };

    setBullets((prev) => [...prev, newBullet]);
    setVentText("");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Timer Section (摸鱼计时器) */}
      <section className="glass-card rounded-3xl p-6 shadow-sm border border-gray-100 relative">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5 mb-4">
          <span className={`material-symbols-outlined ${isTimerRunning ? "animate-spin text-green-500" : "text-blue-500"}`}>
            timer
          </span>
          带薪摸鱼计时器
        </h3>

        {isTimerRunning ? (
          /* Running State */
          <div className="flex flex-col items-center py-6 space-y-5 animate-fade-in">
            {/* Pulsing Breathing circle */}
            <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 relative animate-pulse ${
              isMadness ? "border-red-500 bg-red-50/20" : "border-green-500 bg-green-50/20"
            }`}>
              <span className="text-3xl font-black font-mono text-gray-800">
                {formatTime(secondsElapsed)}
              </span>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1 animate-pulse">
                INTRUDING CAPITAL...
              </span>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">正在进行: <strong className="text-gray-800">{selectedActivity}</strong></p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">💡 保持平稳呼吸，不要往工位看，眼神假装在看报错日志</p>
            </div>

            <button
              onClick={handleStopTimer}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs tracking-wider shadow-md shadow-red-100 transition-all active:scale-95 cursor-pointer"
            >
              完成摸鱼，回归现实
            </button>
          </div>
        ) : (
          /* Idle State */
          <div className="space-y-4">
            {slackMessage && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-xs text-green-800 font-bold text-center leading-relaxed whitespace-pre-line animate-fade-in">
                {slackMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                选择当前摸鱼行为
              </label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
              >
                {activities.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStartTimer}
              className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                isMadness ? "bg-red-600 shadow-red-100" : "bg-blue-600 shadow-blue-100"
              }`}
            >
              <span className="material-symbols-outlined text-base">play_arrow</span>
              开始安全带薪摸鱼
            </button>
          </div>
        )}
      </section>

      {/* Bullet Screen Venting Wall (发泄吐槽墙) */}
      <section className="glass-card rounded-3xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5 mb-3">
          <span className="material-symbols-outlined text-orange-500">forum</span>
          牛马/学术弹幕发泄墙
        </h3>

        {/* Bullet screen display area */}
        <div 
          ref={bulletContainerRef}
          className="h-56 w-full bg-gray-900 rounded-2xl border border-gray-950 relative overflow-hidden select-none"
        >
          {/* Fading overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/20 via-transparent to-gray-950/20 pointer-events-none z-10"></div>
          
          {bullets.map((b) => (
            <div
              key={b.id}
              className={`absolute text-[11px] whitespace-nowrap pointer-events-none transition-all duration-75 select-none ${b.color}`}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              {b.text}
            </div>
          ))}
          
          {bullets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
              吐槽墙已净空，快来写下第一条心声！
            </div>
          )}
        </div>

        {/* Form input */}
        <form onSubmit={handleVentSubmit} className="flex gap-2 mt-3">
          <input
            type="text"
            required
            value={ventText}
            onChange={(e) => setVentText(e.target.value)}
            placeholder="写下你此时此刻最想吐槽的废话（点击发送弹幕飘过）"
            maxLength={60}
            className="flex-1 p-3 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
          <button
            type="submit"
            className={`px-4 rounded-xl text-white font-bold text-xs transition-all hover:opacity-90 active:scale-95 shrink-0 ${
              isMadness ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            发送弹幕
          </button>
        </form>
      </section>

      {/* 趣味解压工具箱 */}
      <section className="glass-card rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-indigo-500">construction</span>
            称谓及解压工具箱
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">
            UTILITIES
          </span>
        </div>

        {/* 4 Tabs Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-50 rounded-2xl border border-gray-100/50">
          <button
            type="button"
            onClick={() => setActiveSubTool("wheel")}
            className={`py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeSubTool === "wheel"
                ? isMadness
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            大转盘
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTool("finger")}
            className={`py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeSubTool === "finger"
                ? isMadness
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            手指计算
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTool("relative")}
            className={`py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeSubTool === "relative"
                ? isMadness
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            亲戚计算
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTool("gender")}
            className={`py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeSubTool === "gender"
                ? isMadness
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            性别预测
          </button>
        </div>

        {/* Selected Tool container */}
        <div className="pt-2 animate-fade-in">
          {activeSubTool === "wheel" && <LuckyWheel isMadness={isMadness} />}
          {activeSubTool === "finger" && <FingerCalculator />}
          {activeSubTool === "relative" && <RelationshipCalculator isMadness={isMadness} />}
          {activeSubTool === "gender" && <GenderPredictor />}
        </div>
      </section>

      {/* Quick Access to AI tools */}
      <section className="space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider block">量子AI诊断专区</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenEnergyModal}
            className="p-4 bg-orange-50/70 hover:bg-orange-50 border border-orange-100 text-left rounded-2xl transition-all cursor-pointer group active:scale-98"
          >
            <span className="material-symbols-outlined text-2xl text-orange-600 mb-1 group-hover:scale-110 transition-transform">
              bolt
            </span>
            <span className="text-xs font-bold text-gray-800 block">能量场检测</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">解码导师黑话与危险系数</span>
          </button>

          <button
            onClick={onOpenTribunalModal}
            className="p-4 bg-purple-50/70 hover:bg-purple-50 border border-purple-100 text-left rounded-2xl transition-all cursor-pointer group active:scale-98"
          >
            <span className="material-symbols-outlined text-2xl text-purple-600 mb-1 group-hover:scale-110 transition-transform">
              gavel
            </span>
            <span className="text-xs font-bold text-gray-800 block">小事法官</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">宣判琐碎矛盾，舒缓压力</span>
          </button>
        </div>
      </section>
    </div>
  );
};
