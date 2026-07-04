import React, { useState } from "react";
import { Identity, Task } from "../types";

interface TabHomeProps {
  identity: Identity;
  setIdentity: (id: Identity) => void;
  isMadness: boolean;
  toggleMadness: () => void;
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (text: string) => void;
  onOpenEnergyModal: () => void;
  onOpenTribunalModal: () => void;
  onOpenTaskGoalModal: () => void;
}

export const TabHome: React.FC<TabHomeProps> = ({
  identity,
  setIdentity,
  isMadness,
  toggleMadness,
  tasks,
  onToggleTask,
  onAddTask,
  onOpenEnergyModal,
  onOpenTribunalModal,
  onOpenTaskGoalModal,
}) => {
  const [newTaskText, setNewTaskText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [emotionFeedback, setEmotionFeedback] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Compute mock status based on progress
  const getStatusText = () => {
    if (progressPercent === 100) return "已看破红尘 (超脱)";
    if (progressPercent > 70) return "优雅躺平中";
    if (progressPercent > 40) return "轻度焦虑";
    if (progressPercent > 10) return "中度焦虑 (微急)";
    return "重度摆烂 (狂躁)";
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim());
    setNewTaskText("");
    setIsAdding(false);
  };

  const handleEmotionClick = (emotion: string) => {
    if (emotion === "crazy") {
      toggleMadness();
      setEmotionFeedback("已触发【红色狂躁模式】！疯狂吐槽中...");
    } else if (emotion === "happy") {
      setEmotionFeedback("开心+1！世界确实很美好！");
    } else if (emotion === "okay") {
      setEmotionFeedback("状态还行！不喜不悲，继续Grind！");
    } else {
      setEmotionFeedback("平静如水。宁静致远，放空一切。");
    }
    setTimeout(() => setEmotionFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Identity Switcher */}
      <section className="flex justify-center pt-2">
        <div className="glass-card p-1 rounded-full flex items-center shadow-sm">
          <button
            onClick={() => setIdentity("Student")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
              identity === "Student"
                ? isMadness
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setIdentity("Worker")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
              identity === "Worker"
                ? isMadness
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Worker (牛马)
          </button>
        </div>
      </section>

      {/* Slogan Greeting */}
      <section className="py-2 text-center">
        {isMadness ? (
          <h2 className="font-display text-2xl text-red-600 italic font-black animate-pulse uppercase tracking-wide">
            疯了！全都疯了！！
          </h2>
        ) : (
          <h2 className="font-display text-2xl text-gray-800 italic font-semibold">
            今天，有没有如你所愿？
          </h2>
        )}
        <p className="text-xs text-gray-400 mt-1.5 font-medium">
          {isMadness ? "【红色暴躁状态下，AI生成分析将更加犀利刺骨】" : "在疯狂中保持优雅地活着。"}
        </p>
      </section>

      {/* Emotion Banner Feedback */}
      {emotionFeedback && (
        <div className={`p-3 rounded-xl text-center text-xs font-bold border animate-fade-in ${
          isMadness ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
        }`}>
          {emotionFeedback}
        </div>
      )}

      {/* Emotion Buttons */}
      <section className="grid grid-cols-4 gap-3">
        <button
          onClick={() => handleEmotionClick("happy")}
          className="flex flex-col items-center gap-2 p-3.5 glass-card rounded-2xl active:scale-95 hover:bg-yellow-50/50 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform shadow-inner">
            <span className="material-symbols-outlined text-3xl material-fill">sentiment_very_satisfied</span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">开心</span>
        </button>

        <button
          onClick={() => handleEmotionClick("okay")}
          className="flex flex-col items-center gap-2 p-3.5 glass-card rounded-2xl active:scale-95 hover:bg-blue-50/50 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner">
            <span className="material-symbols-outlined text-3xl material-fill">sentiment_satisfied</span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">还行</span>
        </button>

        <button
          onClick={() => handleEmotionClick("crazy")}
          className={`flex flex-col items-center gap-2 p-3.5 glass-card rounded-2xl active:scale-95 transition-all cursor-pointer group ${
            isMadness ? "bg-red-50 border-red-200" : "hover:bg-red-50/50"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform shadow-inner">
            <span className="material-symbols-outlined text-3xl material-fill">sentiment_extremely_dissatisfied</span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isMadness ? "text-red-600 font-extrabold" : "text-gray-500"}`}>疯狂</span>
        </button>

        <button
          onClick={() => handleEmotionClick("calm")}
          className="flex flex-col items-center gap-2 p-3.5 glass-card rounded-2xl active:scale-95 hover:bg-emerald-50/50 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-inner">
            <span className="material-symbols-outlined text-3xl material-fill">potted_plant</span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">平静</span>
        </button>
      </section>

      {/* More / Additional vent trigger */}
      <div className="flex justify-center -mt-2">
        <button
          onClick={() => toggleMadness()}
          className="flex items-center gap-1 px-5 py-2 glass-card rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95 group cursor-pointer"
        >
          <span className={`material-symbols-outlined text-lg transition-transform group-hover:rotate-180 ${isMadness ? "text-red-500" : "text-gray-400"}`}>
            settings_backup_restore
          </span>
          <span className="tracking-widest">{isMadness ? "重置心流" : "一键发疯"}</span>
        </button>
      </div>

      {/* Mental State Card (精神状态) */}
      <section className="glass-card rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-30 ${isMadness ? "bg-red-500" : "bg-blue-500"}`}></div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
              精神状态
              <span className={`material-symbols-outlined material-fill ${isMadness ? "text-red-600" : "text-blue-600"}`}>
                psychology
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-1.5">
              当前身份: <span className={`font-extrabold ${isMadness ? "text-red-600" : "text-blue-600"}`}>{identity}</span> • 状态: <span className="font-extrabold text-orange-600">{getStatusText()}</span>
            </p>
          </div>
          
          {/* Circular Progress Indicator */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Svg ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * progressPercent) / 100}
                className={`transition-all duration-700 ${isMadness ? "text-red-600" : "text-blue-600"}`}
              />
            </svg>
            <span className={`absolute text-[10px] font-black ${isMadness ? "text-red-600" : "text-blue-600"}`}>
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Checkbox Task List */}
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <label
              key={task.id}
              className="flex items-center gap-3.5 p-3.5 bg-white/50 hover:bg-white rounded-2xl cursor-pointer border border-gray-100/50 transition-all hover:shadow-xs group"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className={`w-5 h-5 rounded-full border-2 focus:ring-0 cursor-pointer transition-all ${
                  isMadness 
                    ? "border-red-600 text-red-600" 
                    : "border-blue-600 text-blue-600"
                }`}
              />
              <span className={`text-xs text-gray-800 transition-all ${
                task.completed ? "line-through opacity-40 font-medium" : "font-semibold"
              }`}>
                {task.text}
              </span>
            </label>
          ))}
        </div>

        {/* Inline Task Adder */}
        <div className="mt-4">
          {isAdding ? (
            <form onSubmit={handleAddTaskSubmit} className="flex gap-2 animate-fade-in">
              <input
                type="text"
                autoFocus
                required
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="例如：假装思考了5分钟..."
                className="flex-1 p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
              <button
                type="submit"
                className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs transition-all ${
                  isMadness ? "bg-red-600" : "bg-blue-600"
                }`}
              >
                添加
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs"
              >
                取消
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              添加属于你的“牛马/学术”琐事任务
            </button>
          )}
        </div>
      </section>

      {/* Bento Layout Grid for AI Features */}
      <section className="grid grid-cols-2 gap-4">
        {/* Boss Energy Analyzer card */}
        <div
          onClick={onOpenEnergyModal}
          className="glass-card p-5 rounded-2xl flex flex-col justify-between h-40 hover:shadow-md transition-all group cursor-pointer border border-gray-100 relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-20 h-20 bg-orange-100 rounded-full opacity-20 blur-xl group-hover:scale-125 transition-all"></div>
          <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform shadow-xs">
            <span className="material-symbols-outlined text-2xl">bolt</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 leading-tight">
              {identity === "Student" ? "导师能量场分析" : "老板能量场分析"}
            </h4>
            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest font-sans">
              ENERGY FIELD
            </p>
          </div>
        </div>

        {/* Small Things Tribunal card */}
        <div
          onClick={onOpenTribunalModal}
          className="glass-card p-5 rounded-2xl flex flex-col justify-between h-40 hover:shadow-md transition-all group cursor-pointer border border-gray-100 relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-20 h-20 bg-purple-100 rounded-full opacity-20 blur-xl group-hover:scale-125 transition-all"></div>
          <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-xs">
            <span className="material-symbols-outlined text-2xl">gavel</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 leading-tight">小事审判庭</h4>
            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest font-sans">
              TRIBUNAL
            </p>
          </div>
        </div>
      </section>

      {/* Function Button Entries & Footer Quote */}
      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onOpenTaskGoalModal}
            className={`p-4 rounded-2xl text-white flex items-center justify-center gap-2 font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer ${
              isMadness ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            <span className="material-symbols-outlined text-lg">rocket_launch</span>
            人生大计
          </button>
          
          <button
            onClick={onOpenTaskGoalModal}
            className="bg-white hover:bg-gray-50 border border-gray-200 p-4 rounded-2xl text-gray-800 flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg text-emerald-500">flag</span>
            长期小目标
          </button>
        </div>

        {/* Bottom summary and custom text */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-blue-500 border border-gray-100">
          <p className="text-sm text-gray-700">
            今日 <span className={`font-black ${isMadness ? "text-red-600" : "text-blue-600"}`}>{totalCount}</span> 个任务，已完成 <span className={`font-black ${isMadness ? "text-red-600" : "text-blue-600"}`}>{completedCount}</span> 个。
          </p>
          <p className="text-xs text-gray-500 mt-2.5 italic leading-relaxed">
            今年要：<span className="underline decoration-orange-400/40 decoration-2 underline-offset-4">在疯狂中保持优雅地活着</span>，加油打工人！
          </p>
        </div>
      </section>
    </div>
  );
};
