import React, { useState, useEffect, useRef } from "react";
import { Identity, VentingMessage } from "../types";
import { BOSS_VIBES, VENT_BACKGROUND_COMMENTS } from "../data";
import { LuckyWheel, FingerCalculator, RelationshipCalculator, GenderPredictor } from "./ExtraTools";

type BulletMessage = VentingMessage & {
  paused?: boolean;
};

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
  const [activeSubTool, setActiveSubTool] = useState<"timer" | "wheel" | "finger" | "relative" | "gender">("timer");
  const [emotionFeedback, setEmotionFeedback] = useState<string | null>(null);
  const [showMoreEmotions, setShowMoreEmotions] = useState(false);

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
  const [bullets, setBullets] = useState<BulletMessage[]>([]);
  const [selectedBulletId, setSelectedBulletId] = useState<string | null>(null);
  const [editingBulletText, setEditingBulletText] = useState("");

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
          if (b.paused) return b;
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

  const primaryEmotions = [
    {
      key: "happy",
      label: "开心",
      icon: "sentiment_very_satisfied",
      buttonClass: "hover:bg-yellow-50/50",
      iconClass: "bg-yellow-100 text-yellow-600",
    },
    {
      key: "sad",
      label: "伤心",
      icon: "sentiment_dissatisfied",
      buttonClass: "hover:bg-sky-50/50",
      iconClass: "bg-sky-100 text-sky-600",
    },
    {
      key: "calm",
      label: "平静",
      icon: "self_improvement",
      buttonClass: "hover:bg-emerald-50/50",
      iconClass: "bg-emerald-100 text-emerald-600",
    },
  ];

  const moreEmotions = ["开心", "悲伤", "害怕", "焦虑", "兴奋", "孤独", "无聊", "烦躁", "平静", "满足"];

  const emotionMessages: Record<string, string> = {
    开心: "开心已登记。请继续把好运气合理挥霍。",
    伤心: "伤心也算数。先别急着变好，慢慢来。",
    悲伤: "悲伤已收到。今天可以把世界音量调低一点。",
    害怕: "害怕不是退缩，是系统正在提醒你小心通过。",
    焦虑: "焦虑已捕获。先处理下一件最小的事。",
    兴奋: "兴奋值上升。趁热把灵感抓住。",
    孤独: "孤独已记录。你不是一个人在这片空白里。",
    无聊: "无聊也很珍贵，说明大脑正在偷偷重启。",
    烦躁: "烦躁已收纳。先别爆炸，给自己留三秒缓冲。",
    平静: "平静很好。继续稳稳地漂着。",
    满足: "满足已保存。今天至少有一小块是你的。",
  };

  const handleEmotionSelect = (emotion: string) => {
    setEmotionFeedback(emotionMessages[emotion] || `${emotion}已记录。`);
    setTimeout(() => setEmotionFeedback(null), 3000);
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

    const newBullet: BulletMessage = {
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

  const selectedBullet = selectedBulletId ? bullets.find((bullet) => bullet.id === selectedBulletId) : null;

  const handleBulletClick = (bullet: BulletMessage) => {
    setBullets((prev) =>
      prev.map((item) =>
        item.id === bullet.id ? { ...item, paused: true } : item
      )
    );
    setSelectedBulletId(bullet.id);
    setEditingBulletText(bullet.text);
  };

  const handleSaveBullet = () => {
    if (!selectedBulletId || !editingBulletText.trim()) return;
    setBullets((prev) =>
      prev.map((bullet) =>
        bullet.id === selectedBulletId ? { ...bullet, text: editingBulletText.trim(), paused: false } : bullet
      )
    );
    setSelectedBulletId(null);
    setEditingBulletText("");
  };

  const handleDeleteBullet = () => {
    if (!selectedBulletId) return;
    setBullets((prev) => prev.filter((bullet) => bullet.id !== selectedBulletId));
    setSelectedBulletId(null);
    setEditingBulletText("");
  };

  const handleCancelBulletEdit = () => {
    if (selectedBulletId) {
      setBullets((prev) =>
        prev.map((bullet) =>
          bullet.id === selectedBulletId ? { ...bullet, paused: false } : bullet
        )
      );
    }
    setSelectedBulletId(null);
    setEditingBulletText("");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const renderTimerPanel = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
        <span className={`material-symbols-outlined ${isTimerRunning ? "animate-spin text-green-500" : "text-blue-500"}`}>
          timer
        </span>
        摸鱼计时器
      </h4>

      {isTimerRunning ? (
        <div className="flex flex-col items-center py-5 space-y-5 animate-fade-in">
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
            <p className="text-[10px] text-emerald-600 font-bold mt-1">保持平稳呼吸，不要往工位看。</p>
          </div>

          <button
            onClick={handleStopTimer}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs tracking-wider shadow-md shadow-red-100 transition-all active:scale-95 cursor-pointer"
          >
            完成摸鱼，回归现实
          </button>
        </div>
      ) : (
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
    </div>
  );

  return (
    <div className="relative isolate space-y-6 animate-fade-in pb-12 md:grid md:grid-cols-[minmax(420px,560px)_minmax(320px,420px)] md:items-start md:gap-6 md:space-y-0">
      <section className="fixed inset-0 -z-10 hidden bg-gray-950 overflow-hidden select-none md:block" aria-label="弹幕墙">
        <div className="absolute left-4 top-20 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold text-white/70 backdrop-blur-sm">
          <span className="material-symbols-outlined text-sm text-orange-300">forum</span>
          弹幕墙
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(244,63,94,0.12),transparent_26%)] pointer-events-none" />

        {bullets.map((bullet) => (
          <button
            key={bullet.id}
            type="button"
            onClick={() => handleBulletClick(bullet)}
            className={`absolute z-10 max-w-[70vw] truncate text-[12px] whitespace-nowrap rounded-full px-2 py-1 text-left transition-all duration-75 select-none cursor-pointer hover:bg-white/10 hover:scale-105 ${
              bullet.paused ? "bg-white/15 ring-1 ring-white/40" : ""
            } ${bullet.color}`}
            style={{
              left: `${bullet.x}%`,
              top: `${bullet.y}%`,
              textShadow: "1px 1px 2px rgba(0,0,0,0.85)",
            }}
            title="点击暂停并编辑弹幕"
          >
            {bullet.text}
          </button>
        ))}

        {bullets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/40">
            弹幕墙空了，右下角写一条吧。
          </div>
        )}
      </section>

      <form
        onSubmit={selectedBullet ? (e) => { e.preventDefault(); handleSaveBullet(); } : handleVentSubmit}
        className="z-40 hidden w-full rounded-2xl border border-white/20 bg-white/90 p-3 shadow-2xl backdrop-blur-xl md:sticky md:top-24 md:col-start-2 md:row-start-1 md:block"
      >
        {selectedBullet ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500">正在编辑已暂停弹幕</span>
              <button
                type="button"
                onClick={handleCancelBulletEdit}
                className="h-7 w-7 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                title="取消"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={editingBulletText}
              onChange={(e) => setEditingBulletText(e.target.value)}
              maxLength={60}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDeleteBullet}
                className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 active:scale-95"
              >
                删除弹幕
              </button>
              <button
                type="submit"
                className={`rounded-xl px-3 py-2 text-xs font-bold text-white active:scale-95 ${isMadness ? "bg-red-600" : "bg-blue-600"}`}
              >
                保存弹幕
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={ventText}
              onChange={(e) => setVentText(e.target.value)}
              placeholder="写一条弹幕..."
              maxLength={60}
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className={`shrink-0 rounded-xl px-4 text-xs font-bold text-white transition-all active:scale-95 ${
                isMadness ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              发送
            </button>
          </div>
        )}
      </form>

      <div className="space-y-6 md:col-start-1 md:row-start-1">
      <section className="glass-card rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="text-center">
          <h2 className="font-display text-2xl text-gray-800 italic font-semibold">
            今天，有没有如你所愿？
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 font-medium">
            {isMadness ? "情绪可以凌乱，工具仍然在线。" : "先确认心情，再开始今天的摸鱼。"}
          </p>
        </div>

        {emotionFeedback && (
          <div className={`p-3 rounded-xl text-center text-xs font-bold border animate-fade-in ${
            isMadness ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
          }`}>
            {emotionFeedback}
          </div>
        )}

        <div className="grid grid-cols-4 gap-3">
          {primaryEmotions.map((emotion) => (
            <button
              key={emotion.key}
              type="button"
              onClick={() => handleEmotionSelect(emotion.label)}
              className={`flex flex-col items-center gap-2 p-3.5 glass-card rounded-2xl active:scale-95 transition-all cursor-pointer group ${emotion.buttonClass}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner ${emotion.iconClass}`}>
                <span className="material-symbols-outlined text-3xl material-fill">{emotion.icon}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{emotion.label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowMoreEmotions((value) => !value)}
            className={`flex flex-col items-center gap-2 p-3.5 glass-card rounded-2xl active:scale-95 transition-all cursor-pointer group ${
              showMoreEmotions ? "bg-purple-50 border-purple-200" : "hover:bg-purple-50/50"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-inner">
              <span className="material-symbols-outlined text-3xl material-fill">more_horiz</span>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">其它</span>
          </button>
        </div>

        {showMoreEmotions && (
          <div className="grid grid-cols-5 gap-2 animate-fade-in">
            {moreEmotions.map((emotion) => (
              <button
                key={emotion}
                type="button"
                onClick={() => handleEmotionSelect(emotion)}
                className="min-h-9 px-2 rounded-xl bg-white border border-gray-100 text-[11px] font-bold text-gray-600 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
              >
                {emotion}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card rounded-3xl border border-gray-100 p-5 shadow-sm md:hidden">
        <h3 className="mb-3 flex items-center gap-1.5 text-base font-bold text-gray-800">
          <span className="material-symbols-outlined text-orange-500">forum</span>
          弹幕墙
        </h3>

        <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-gray-950 bg-gray-900 select-none">
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-gray-950/20 via-transparent to-gray-950/20" />

          {bullets.map((bullet) => (
            <button
              key={bullet.id}
              type="button"
              onClick={() => handleBulletClick(bullet)}
              className={`absolute z-20 max-w-[75%] truncate rounded-full px-2 py-1 text-left text-[11px] whitespace-nowrap transition-all duration-75 hover:bg-white/10 ${
                bullet.paused ? "bg-white/15 ring-1 ring-white/40" : ""
              } ${bullet.color}`}
              style={{
                left: `${bullet.x}%`,
                top: `${bullet.y}%`,
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
              }}
              title="点击暂停并编辑弹幕"
            >
              {bullet.text}
            </button>
          ))}

          {bullets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
              弹幕墙空了，写下第一条心声吧。
            </div>
          )}
        </div>

        <form
          onSubmit={selectedBullet ? (e) => { e.preventDefault(); handleSaveBullet(); } : handleVentSubmit}
          className="mt-3"
        >
          {selectedBullet ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">正在编辑已暂停弹幕</span>
                <button
                  type="button"
                  onClick={handleCancelBulletEdit}
                  className="h-7 w-7 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  title="取消"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={editingBulletText}
                onChange={(e) => setEditingBulletText(e.target.value)}
                maxLength={60}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDeleteBullet}
                  className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 active:scale-95"
                >
                  删除弹幕
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-3 py-2 text-xs font-bold text-white active:scale-95 ${isMadness ? "bg-red-600" : "bg-blue-600"}`}
                >
                  保存弹幕
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={ventText}
                onChange={(e) => setVentText(e.target.value)}
                placeholder="写一条弹幕..."
                maxLength={60}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                className={`shrink-0 rounded-xl px-4 text-xs font-bold text-white transition-all active:scale-95 ${
                  isMadness ? "bg-red-600" : "bg-blue-600"
                }`}
              >
                发送
              </button>
            </div>
          )}
        </form>
      </section>

      {/* 趣味解压工具箱 */}
      <section className="glass-card rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-indigo-500">construction</span>
            解压工具箱
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">
            UTILITIES
          </span>
        </div>

        {/* Tabs Selector */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-gray-50 rounded-2xl border border-gray-100/50">
          <button
            type="button"
            onClick={() => setActiveSubTool("timer")}
            className={`py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeSubTool === "timer"
                ? isMadness
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            计时器
          </button>
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
          {activeSubTool === "timer" && renderTimerPanel()}
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
    </div>
  );
};
