import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Identity, VentingMessage } from "../types";
import { BOSS_VIBES, VENT_BACKGROUND_COMMENTS } from "../data";
import { LuckyWheel, FingerCalculator, RelationshipCalculator, GenderPredictor } from "./ExtraTools";

type BulletMessage = VentingMessage & {
  paused?: boolean;
};

const getRandomBulletColor = () => {
  const colors = [
    "bg-rose-500/15 text-rose-300",
    "bg-orange-500/15 text-orange-300",
    "bg-yellow-500/15 text-yellow-300",
    "bg-cyan-500/15 text-cyan-300",
    "bg-blue-500/15 text-blue-300",
    "bg-violet-500/15 text-violet-300",
    "bg-pink-500/15 text-pink-300",
    "bg-emerald-500/15 text-emerald-300",
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

interface TabToolsProps {
  identity?: Identity;
  isMadness: boolean;
  onOpenEnergyModal: () => void;
  onOpenTribunalModal: () => void;
  onAddSlackingHours: (hoursToAdd: number) => void;
  onAddHistory: (type: "slack_session", title: string, subtitle: string, details: any) => void;
}

export const TabTools: React.FC<TabToolsProps> = ({
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
  const [isBulletWallOpen, setIsBulletWallOpen] = useState(false);
  const [bulletMode, setBulletMode] = useState<"wall" | "sky">("wall");
  const [isBulletModeMenuOpen, setIsBulletModeMenuOpen] = useState(false);

  // Initialize initial mock bullet messages
  useEffect(() => {
    const initialBullets = VENT_BACKGROUND_COMMENTS.map((text, idx) => ({
      id: `init_${idx}`,
      text,
      timestamp: Date.now(),
      x: 10 + Math.random() * 80,
      y: 10 + (idx * 9) % 80, // spaced vertically
      color: `${getRandomBulletColor()} font-bold`,
      speed: 0.5 + Math.random() * 0.8,
    }));
    setBullets(initialBullets);
  }, []);

  // Bullet drift animation runner
  useEffect(() => {
    const interval = setInterval(() => {
      const tick = Date.now();
      setBullets((prevBullets) =>
        prevBullets.map((b, index) => {
          if (b.paused) return b;

          if (bulletMode === "sky") {
            let newY = b.y - b.speed * 0.22;
            let newX = b.x + Math.sin(tick / 700 + index * 1.7) * 0.07;

            if (newY < -12) {
              newY = 100;
              newX = 10 + Math.random() * 80;
            }

            return {
              ...b,
              x: Math.max(2, Math.min(95, newX)),
              y: newY,
            };
          }

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
  }, [bulletMode]);

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
      x: bulletMode === "sky" ? 10 + Math.random() * 80 : 100,
      y: bulletMode === "sky" ? 100 : 10 + Math.random() * 75,
      color: `${getRandomBulletColor()} font-bold`,
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

  const handleClearBullets = () => {
    if (bullets.length === 0) return;
    if (!window.confirm("确定要清空全部弹幕吗？")) return;

    setBullets([]);
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

  const handleCloseBulletWall = () => {
    handleCancelBulletEdit();
    setIsBulletModeMenuOpen(false);
    setIsBulletWallOpen(false);
  };

  const handleBulletModeChange = (mode: "wall" | "sky") => {
    handleCancelBulletEdit();
    setBullets((currentBullets) =>
      currentBullets.map((bullet, index) => ({
        ...bullet,
        paused: false,
        x: mode === "sky" ? 8 + (index * 13) % 84 : 100 + (index % 6) * 14,
        y: mode === "sky" ? 100 + (index % 6) * 10 : 8 + (index * 11) % 78,
      }))
    );
    setBulletMode(mode);
    setIsBulletModeMenuOpen(false);
  };

  useEffect(() => {
    if (!isBulletWallOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleCloseBulletWall();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBulletWallOpen, selectedBulletId]);

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
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12 animate-fade-in">
      {/* 第一行：心情选择 */}
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

      {/* 第二行：AI 检测工具 */}
      <section className="glass-card space-y-4 rounded-3xl border border-gray-100 p-4 shadow-sm sm:p-5">
        <h3 className="flex items-center gap-1.5 text-base font-bold text-gray-800">
          <span className="material-symbols-outlined text-amber-500">neurology</span>
          量子 AI 诊断专区
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onOpenEnergyModal}
            className="group rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-left transition-all hover:bg-orange-50 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined mb-1 text-2xl text-orange-600 transition-transform group-hover:scale-110">
              bolt
            </span>
            <span className="block text-xs font-bold text-gray-800">能量场检测</span>
            <span className="mt-0.5 block text-[10px] text-gray-500">解码导师/老板黑话与危险系数</span>
          </button>

          <button
            type="button"
            onClick={onOpenTribunalModal}
            className="group rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-left transition-all hover:bg-purple-50 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined mb-1 text-2xl text-purple-600 transition-transform group-hover:scale-110">
              gavel
            </span>
            <span className="block text-xs font-bold text-gray-800">小事审判庭</span>
            <span className="mt-0.5 block text-[10px] text-gray-500">宣判琐碎矛盾，舒缓压力</span>
          </button>
        </div>
      </section>

      {/* 第三行：弹幕 */}
      <button
        type="button"
        onClick={() => setIsBulletWallOpen(true)}
        className="group relative w-full overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md active:scale-[0.99]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.08),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(244,63,94,0.07),transparent_30%)]" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
              <span className="material-symbols-outlined text-orange-500">forum</span>
              弹幕墙
            </h3>
            <p className="mt-1 text-xs text-gray-500">点击进入全屏弹幕，把情绪扔进人海</p>
          </div>
          <span className="material-symbols-outlined rounded-full bg-blue-50 p-2 text-blue-600 transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </div>
      </button>

      {/* 第四行：解压工具箱 */}
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

      {isBulletWallOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-gray-950" role="dialog" aria-modal="true" aria-label="全屏弹幕墙">
          <div className="relative min-h-0 flex-1 overflow-hidden select-none">
            <div className={`pointer-events-none absolute inset-0 transition-colors duration-500 ${
              bulletMode === "sky"
                ? "bg-gradient-to-b from-sky-950 via-blue-950 to-indigo-950"
                : "bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"
            }`} />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_80%_35%,rgba(244,63,94,0.16),transparent_28%)]" />

            <div className="absolute left-4 top-4 z-40 sm:left-6 sm:top-6">
              <button
                type="button"
                aria-expanded={isBulletModeMenuOpen}
                onClick={() => setIsBulletModeMenuOpen((open) => !open)}
                className="flex h-10 items-center gap-1.5 rounded-full bg-black/45 px-3 text-xs font-bold text-white/80 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white"
              >
                <span className={`material-symbols-outlined text-base ${bulletMode === "sky" ? "text-sky-300" : "text-orange-300"}`}>
                  {bulletMode === "sky" ? "cloud" : "forum"}
                </span>
                {bulletMode === "sky" ? "天空" : "弹幕墙"}
                <span className={`material-symbols-outlined text-base transition-transform ${isBulletModeMenuOpen ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>

              {isBulletModeMenuOpen && (
                <div className="mt-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-gray-950/90 p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in">
                  <button
                    type="button"
                    onClick={() => handleBulletModeChange("wall")}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      bulletMode === "wall" ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-orange-300">forum</span>
                    <span>
                      <span className="block text-xs font-bold">弹幕墙</span>
                      <span className="block text-[10px] text-white/40">横向飘过</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulletModeChange("sky")}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      bulletMode === "sky" ? "bg-sky-500/20 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-sky-300">cloud</span>
                    <span>
                      <span className="block text-xs font-bold">天空</span>
                      <span className="block text-[10px] text-white/40">向上飞，轻微左右漂移</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
            <div className="absolute right-4 top-4 z-40 flex items-center gap-2 sm:right-6 sm:top-6">
              <button
                type="button"
                onClick={handleClearBullets}
                disabled={bullets.length === 0}
                className="flex h-10 items-center gap-1 rounded-full bg-black/45 px-3 text-xs font-bold text-white/80 backdrop-blur-sm transition-all hover:bg-red-500/30 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                title="清空全部弹幕"
              >
                <span className="material-symbols-outlined text-lg">delete_sweep</span>
                清空
              </button>
              <button
                type="button"
                onClick={handleCloseBulletWall}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-90"
                title="关闭弹幕墙"
                aria-label="关闭弹幕墙"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {bullets.map((bullet) => (
              <button
                key={bullet.id}
                type="button"
                onClick={() => handleBulletClick(bullet)}
                className={`absolute z-20 overflow-hidden rounded-full px-2 py-1 text-left text-xs whitespace-nowrap transition-all duration-75 hover:bg-white/10 sm:text-sm ${
                  bulletMode === "sky" ? "max-h-[70vh] max-w-none" : "max-w-[80vw] truncate"
                } ${
                  bullet.paused ? "bg-white/15 ring-1 ring-white/40" : ""
                } ${bullet.color}`}
                style={{
                  left: `${bullet.x}%`,
                  top: `${bullet.y}%`,
                  textShadow: "1px 1px 3px rgba(0,0,0,0.9)",
                  writingMode: bulletMode === "sky" ? "vertical-rl" : "horizontal-tb",
                  textOrientation: bulletMode === "sky" ? "upright" : "mixed",
                }}
                title="点击暂停并编辑弹幕"
              >
                {bullet.text}
              </button>
            ))}

            {bullets.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/35">
                弹幕墙空了，写下第一条心声吧。
              </div>
            )}
          </div>

          <form
            onSubmit={selectedBullet ? (event) => { event.preventDefault(); handleSaveBullet(); } : handleVentSubmit}
            className="safe-bottom relative z-40 shrink-0 border-t border-white/10 bg-gray-950/95 p-3 backdrop-blur-xl sm:p-4"
          >
            <div className="mx-auto w-full max-w-3xl">
              {selectedBullet ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/55">正在编辑已暂停弹幕</span>
                    <button
                      type="button"
                      onClick={handleCancelBulletEdit}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                      title="取消编辑"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editingBulletText}
                    onChange={(event) => setEditingBulletText(event.target.value)}
                    maxLength={60}
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteBullet}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs font-bold text-red-300 active:scale-95"
                    >
                      删除弹幕
                    </button>
                    <button
                      type="submit"
                      className={`rounded-xl px-3 py-2.5 text-xs font-bold text-white active:scale-95 ${isMadness ? "bg-red-600" : "bg-blue-600"}`}
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
                    onChange={(event) => setVentText(event.target.value)}
                    placeholder="写一条弹幕..."
                    maxLength={60}
                    className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    className={`shrink-0 rounded-xl px-5 text-sm font-bold text-white transition-all active:scale-95 ${
                      isMadness ? "bg-red-600" : "bg-blue-600"
                    }`}
                  >
                    发送
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
};
